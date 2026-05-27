from django.db import models
from django.contrib.auth.models import User

class StudentProfile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assessments', null=True, blank=True)
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    tenth_marks = models.FloatField(null=True, blank=True)
    twelfth_marks = models.FloatField(null=True, blank=True)
    expected_marks = models.FloatField(null=True, blank=True)
    stream = models.CharField(max_length=50, null=True, blank=True)
    category = models.CharField(max_length=50, null=True, blank=True, default='General')
    budget = models.IntegerField()
    interests = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name

class CollegeRecommendation(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='recommended_colleges')
    name = models.CharField(max_length=100)
    course = models.CharField(max_length=100)
    fee = models.CharField(max_length=50)
    chance = models.CharField(max_length=20)
    match_score = models.IntegerField()

class CareerPath(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='career_paths')
    title = models.CharField(max_length=100)
    desc = models.TextField()
    growth = models.CharField(max_length=50)
