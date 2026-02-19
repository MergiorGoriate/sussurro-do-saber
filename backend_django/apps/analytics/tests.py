from django.test import TestCase, Client
from django.urls import reverse
from unittest.mock import patch
from apps.analytics.services import AnalyticsService

class AnalyticsTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.view_url = reverse('record_view', args=[1])
        self.presence_url = reverse('update_presence', args=[1])
        self.stats_url = reverse('get_stats', args=[1])

    @patch('apps.analytics.services.AnalyticsService.record_view')
    @patch('apps.analytics.services.AnalyticsService.update_presence')
    def test_record_view(self, mock_presence, mock_record):
        mock_record.return_value = True
        response = self.client.post(self.view_url)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(mock_record.called)
        self.assertTrue(mock_presence.called)

    @patch('apps.analytics.services.AnalyticsService.update_presence')
    def test_update_presence(self, mock_presence):
        response = self.client.post(self.presence_url)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(mock_presence.called)
        
    @patch('apps.analytics.services.AnalyticsService.get_realtime_stats')
    def test_get_stats(self, mock_stats):
        mock_stats.return_value = {'views_delta': 10, 'reading_now': 5}
        response = self.client.get(self.stats_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['views_delta'], 10)
        self.assertEqual(response.json()['reading_now'], 5)
