
from django.urls import path

from .views import (
    health_check,
    assessment_detail,
    my_report,
    start_attempt,
    save_response,
    complete_attempt,
    my_assessment,
)

from .admin_views import (
    AdminAssessmentListCreateView,
    AdminAssessmentDetailView,
    AdminSectionListCreateView,
    AdminQuestionListCreateView,
    AdminOptionListCreateView,
    AdminDimensionListCreateView,
    AdminQuestionDimensionListCreateView,
    admin_dashboard_stats,
)


urlpatterns = [
    # -------------------------
    # Health Check
    # -------------------------

    path(
        "health/",
        health_check,
        name="health-check",
    ),

    # -------------------------
    # Student Assessment
    # -------------------------

    path(
        "my-assessment/",
        my_assessment,
        name="my-assessment",
    ),

    # IMPORTANT: Keep the report route before <slug:slug>/
    path(
        "my-report/",
        my_report,
        name="my-report",
    ),

    # -------------------------
    # Admin APIs
    # -------------------------

    path(
        "admin/assessments/",
        AdminAssessmentListCreateView.as_view(),
        name="admin-assessment-list-create",
    ),

    path(
        "admin/assessments/<int:pk>/",
        AdminAssessmentDetailView.as_view(),
        name="admin-assessment-detail",
    ),

    path(
        "admin/sections/",
        AdminSectionListCreateView.as_view(),
        name="admin-section-list-create",
    ),

    path(
        "admin/questions/",
        AdminQuestionListCreateView.as_view(),
        name="admin-question-list-create",
    ),

    path(
        "admin/options/",
        AdminOptionListCreateView.as_view(),
        name="admin-option-list-create",
    ),

    path(
        "admin/dashboard/stats/",
        admin_dashboard_stats,
        name="admin-dashboard-stats",
    ),

    path(
        "admin/dimensions/",
        AdminDimensionListCreateView.as_view(),
        name="admin-dimension-list-create",
    ),

    path(
        "admin/question-dimensions/",
        AdminQuestionDimensionListCreateView.as_view(),
        name="admin-question-dimension-list-create",
    ),

    # -------------------------
    # Assessment Attempt APIs
    # -------------------------

    path(
        "attempts/<int:attempt_id>/responses/",
        save_response,
        name="save-response",
    ),

    path(
        "attempts/<int:attempt_id>/complete/",
        complete_attempt,
        name="complete-attempt",
    ),

    path(
        "<slug:slug>/attempts/",
        start_attempt,
        name="start-attempt",
    ),

    # IMPORTANT: Generic assessment route must stay LAST
    path(
        "<slug:slug>/",
        assessment_detail,
        name="assessment-detail",
    ),
]
