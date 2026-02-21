from django.db import models
from apps.articles.models import Article

class ArticleMetricDaily(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='daily_metrics')
    day = models.DateField(db_index=True)
    views = models.PositiveIntegerField(default=0)
    uniques = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Métrica Diária"
        verbose_name_plural = "Métricas Diárias"
        unique_together = ('article', 'day')
        indexes = [
            models.Index(fields=['day', '-views']),
        ]

    def __str__(self):
        return f"{self.article.title} - {self.day}"

class ArticleMetricWeekly(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='weekly_metrics')
    year_week = models.CharField(max_length=10, db_index=True) # Format: YYYY-WW
    views = models.PositiveIntegerField(default=0)
    uniques = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Métrica Semanal"
        verbose_name_plural = "Métricas Semanais"
        unique_together = ('article', 'year_week')
        indexes = [
            models.Index(fields=['year_week', '-views']),
        ]

    def __str__(self):
        return f"{self.article.title} - Week {self.year_week}"

class ArticleMetricMonthly(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='monthly_metrics')
    year_month = models.CharField(max_length=7, db_index=True) # Format: YYYY-MM
    views = models.PositiveIntegerField(default=0)
    uniques = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Métrica Mensal"
        verbose_name_plural = "Métricas Mensais"
        unique_together = ('article', 'year_month')
        indexes = [
            models.Index(fields=['year_month', '-views']),
        ]

    def __str__(self):
        return f"{self.article.title} - Month {self.year_month}"
