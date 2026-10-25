from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction

from .services.scoring import calculate_assessment_result

from .models import (
    Assessment,
    AssessmentAttempt,
    AssessmentResult,
    Response as AssessmentResponse,
    Option,
    Question,
    AssessmentAssignment,
)

from .serializers import (
    AssessmentSerializer,
    AssessmentAttemptSerializer,
    ResponseSerializer,
)

from accounts.models import UserProfile


@api_view(["GET"])
def health_check(request):
    return Response({
        "status": "success",
        "message": "Neuromatrix backend is connected."
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def assessment_detail(request, slug):
    """
    Return the complete assessment only if the assessment
    is assigned to the logged-in user's student status.
    """

    # ---------------------------------------------------------
    # Get logged-in user's profile
    # ---------------------------------------------------------

    try:
        profile = request.user.profile

    except UserProfile.DoesNotExist:
        return Response(
            {
                "detail": "Student profile not found."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # Student status must exist
    # ---------------------------------------------------------

    if not profile.student_status:
        return Response(
            {
                "detail": (
                    "Student standard has not been configured."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # Find requested assessment
    # ---------------------------------------------------------

    assessment = get_object_or_404(
        Assessment,
        slug=slug,
        is_active=True,
    )

    # ---------------------------------------------------------
    # SECURITY CHECK
    #
    # Only allow the assessment assigned to this user's
    # student status.
    # ---------------------------------------------------------

    assignment_exists = AssessmentAssignment.objects.filter(
        assessment=assessment,
        student_status=profile.student_status,
        is_active=True,
    ).exists()

    if not assignment_exists:
        return Response(
            {
                "detail": (
                    "This assessment is not assigned "
                    "to your student standard."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    # ---------------------------------------------------------
    # Return assessment
    # ---------------------------------------------------------

    serializer = AssessmentSerializer(
        assessment
    )

    return Response(
        serializer.data
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_assessment(request):
    """
    Return the assessment assigned to the
    currently authenticated user's student status.
    """

    # ---------------------------------------------------------
    # Get logged-in user's profile
    # ---------------------------------------------------------

    try:
        profile = request.user.profile

    except UserProfile.DoesNotExist:
        return Response(
            {
                "detail": "Student profile not found."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # Student status must exist
    # ---------------------------------------------------------

    if not profile.student_status:
        return Response(
            {
                "detail": (
                    "Student standard has not been configured."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # Find assigned assessment
    # ---------------------------------------------------------

    assignment = (
        AssessmentAssignment.objects
        .select_related("assessment")
        .filter(
            student_status=profile.student_status,
            is_active=True,
            assessment__is_active=True,
        )
        .first()
    )

    if not assignment:
        return Response(
            {
                "detail": (
                    "No assessment is currently assigned "
                    "to your student standard."
                )
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    assessment = assignment.assessment

    # ---------------------------------------------------------
    # Assessment statistics
    # ---------------------------------------------------------

    questions = (
        Question.objects
        .filter(
            section__assessment=assessment,
            is_active=True,
        )
        .prefetch_related("options")
    )

    question_count = questions.count()

    response_scale = 0

    first_question = questions.first()

    if first_question:
        response_scale = first_question.options.count()

    # ---------------------------------------------------------
    # Return assignment information
    # ---------------------------------------------------------

    return Response({
        "id": assessment.id,
        "name": assessment.name,
        "slug": assessment.slug,
        "description": assessment.description,
        "version": assessment.version,
        "student_status": assignment.student_status,
        "question_count": question_count,
        "response_scale": response_scale,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_attempt(request, slug):
    """
    Start an assessment attempt only if the requested
    assessment is assigned to the logged-in user's
    student status.
    """

    # ---------------------------------------------------------
    # Get logged-in user's profile
    # ---------------------------------------------------------

    try:
        profile = request.user.profile

    except UserProfile.DoesNotExist:
        return Response(
            {
                "detail": "Student profile not found."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # Student status must exist
    # ---------------------------------------------------------

    if not profile.student_status:
        return Response(
            {
                "detail": (
                    "Student standard has not been configured."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # Find requested assessment
    # ---------------------------------------------------------

    assessment = get_object_or_404(
        Assessment,
        slug=slug,
        is_active=True,
    )

    # ---------------------------------------------------------
    # SECURITY CHECK
    #
    # The requested assessment must be assigned to
    # this user's student status.
    # ---------------------------------------------------------

    assignment_exists = (
        AssessmentAssignment.objects.filter(
            assessment=assessment,
            student_status=profile.student_status,
            is_active=True,
        ).exists()
    )

    if not assignment_exists:
        return Response(
            {
                "detail": (
                    "This assessment is not assigned "
                    "to your student standard."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    # ---------------------------------------------------------
    # Session ID
    # ---------------------------------------------------------

    session_id = request.data.get(
        "session_id",
        "",
    )

    # ---------------------------------------------------------
    # Create attempt
    # ---------------------------------------------------------

    attempt = AssessmentAttempt.objects.create(
        user=request.user,
        assessment=assessment,
        session_id=session_id,
    )

    # ---------------------------------------------------------
    # Return attempt
    # ---------------------------------------------------------

    serializer = AssessmentAttemptSerializer(
        attempt
    )

    return Response(
        serializer.data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_response(request, attempt_id):

    # ---------------------------------------------------------
    # Get user's attempt
    # ---------------------------------------------------------

    attempt = get_object_or_404(
        AssessmentAttempt,
        id=attempt_id,
        user=request.user,
    )

    # ---------------------------------------------------------
    # Prevent modification after completion
    # ---------------------------------------------------------

    if attempt.is_completed:
        return Response(
            {
                "error": (
                    "Cannot modify a completed assessment."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # Request data
    # ---------------------------------------------------------

    question_id = request.data.get(
        "question"
    )

    selected_option_id = request.data.get(
        "selected_option"
    )

    if not question_id or not selected_option_id:
        return Response(
            {
                "error": (
                    "question and selected_option "
                    "are required."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # Validate question
    # ---------------------------------------------------------

    try:

        question = Question.objects.get(
            id=question_id,
            section__assessment=attempt.assessment,
            is_active=True,
        )

    except Question.DoesNotExist:

        return Response(
            {
                "error": (
                    "Invalid question for this assessment."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # Validate option
    # ---------------------------------------------------------

    try:

        option = Option.objects.get(
            id=selected_option_id,
            question=question,
        )

    except Option.DoesNotExist:

        return Response(
            {
                "error": (
                    "Invalid option for this question."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # Save/update response
    # ---------------------------------------------------------

    response_obj, created = (
        AssessmentResponse.objects.update_or_create(
            attempt=attempt,
            question=question,
            defaults={
                "selected_option": option,
            },
        )
    )

    serializer = ResponseSerializer(
        response_obj
    )

    return Response(
        serializer.data,
        status=(
            status.HTTP_201_CREATED
            if created
            else status.HTTP_200_OK
        ),
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def complete_attempt(request, attempt_id):

    # ---------------------------------------------------------
    # Get user's attempt
    # ---------------------------------------------------------

    attempt = get_object_or_404(
        AssessmentAttempt,
        id=attempt_id,
        user=request.user,
    )

    # ---------------------------------------------------------
    # Prevent duplicate completion
    # ---------------------------------------------------------

    if attempt.is_completed:
        return Response(
            {
                "error": (
                    "Assessment already completed."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # Find required questions
    # ---------------------------------------------------------

    required_questions = Question.objects.filter(
        section__assessment=attempt.assessment,
        is_active=True,
        is_required=True,
    )

    required_question_count = (
        required_questions.count()
    )

    # ---------------------------------------------------------
    # Find submitted answers
    # ---------------------------------------------------------

    answered_question_count = (
        AssessmentResponse.objects
        .filter(
            attempt=attempt,
            question__section__assessment=attempt.assessment,
            question__is_active=True,
            question__is_required=True,
        )
        .values("question")
        .distinct()
        .count()
    )

    # ---------------------------------------------------------
    # Prevent incomplete submission
    # ---------------------------------------------------------

    if (
        answered_question_count
        < required_question_count
    ):
        return Response(
            {
                "error": (
                    "Assessment is incomplete."
                ),
                "required_questions": (
                    required_question_count
                ),
                "answered_questions": (
                    answered_question_count
                ),
                "remaining_questions": (
                    required_question_count
                    - answered_question_count
                ),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # Complete + score atomically
    # ---------------------------------------------------------

    try:

        with transaction.atomic():

            attempt.is_completed = True
            attempt.completed_at = timezone.now()

            attempt.save(
                update_fields=[
                    "is_completed",
                    "completed_at",
                ]
            )

            result = calculate_assessment_result(
                attempt
            )

    except ValueError as exc:

        return Response(
            {
                "error": str(exc)
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # Return completion response
    # ---------------------------------------------------------

    return Response(
        {
            "message": (
                "Assessment completed successfully."
            ),
            "attempt_id": attempt.id,
            "result_id": result.id,
            "is_completed": attempt.is_completed,
        },
        status=status.HTTP_200_OK,
    )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_report(request):
    result_id = request.query_params.get("result_id")

    results = (
        AssessmentResult.objects
        .filter(
            attempt__user=request.user,
            attempt__is_completed=True,
        )
        .select_related("attempt__assessment")
    )

    if result_id:
        if not result_id.isdigit():
            return Response(
                {"detail": "Invalid result ID."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = get_object_or_404(
            results,
            pk=int(result_id),
        )
    else:
        result = results.order_by("-created_at").first()

    if result is None:
        return Response(
            {"detail": "No completed report was found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    attempt = result.attempt

    responses = (
        attempt.responses
        .select_related(
            "question",
            "question__section",
            "selected_option",
        )
        .prefetch_related(
            "question__dimension_mappings__dimension"
        )
        .order_by(
            "question__section__order",
            "question__order",
        )
    )

    questions = []

    for number, response in enumerate(responses, start=1):
        question = response.question
        option = response.selected_option

        questions.append({
            "number": number,
            "section": question.section.name,
            "question": question.text,
            "answer": option.text,
            "answer_value": option.value,
            "dimensions": [
                mapping.dimension.name
                for mapping in question.dimension_mappings.all()
            ],
        })

    dimension_results = (
        result.dimension_results
        .select_related("dimension")
        .all()
    )

    return Response({
        "id": result.id,
        "created_at": result.created_at,
        "scoring_version": result.scoring_version,
        "assessment": {
            "name": attempt.assessment.name,
            "slug": attempt.assessment.slug,
        },
        "question_count": Question.objects.filter(
            section__assessment=attempt.assessment,
            is_active=True,
        ).count(),
        "answered_count": len(questions),
        "questions": questions,
        "dimensions": [
            {
                "name": item.dimension.name,
                "code": item.dimension.code,
                "raw_score": item.raw_score,
                "normalized_score": item.normalized_score,
            }
            for item in dimension_results
        ],
    })
