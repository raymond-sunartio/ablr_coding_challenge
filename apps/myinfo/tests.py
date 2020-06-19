from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from django.test import TestCase
from django.urls import reverse

import json
import lxml.html
from selenium import webdriver
import time


# Test individual access point
class MyInfoViewTestCase(TestCase):
    def test_index(self):
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'myinfo/index.html')
    
    def test_callback(self):
        response = self.client.get(reverse('callback'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'myinfo/index.html')
        
    def test_callback_with_error(self):
        error = 'access_denied'
        response = self.client.get(reverse('callback') + f'?error={error}')
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'myinfo/index.html')
        root = lxml.html.fromstring(response.content)
        self.assertTrue(root.xpath('//div[@id="error"]'))
        self.assertTrue(root.xpath('//div[@id="error"]//p')[0].text.strip() == error)
    
    def test_callback_with_error_and_error_description(self):
        error = 'access_denied'
        error_description = 'some_meaningful_description_of_the_error'
        response = self.client.get(reverse('callback') + f'?error={error}&error-description={error_description}')
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'myinfo/index.html')
        root = lxml.html.fromstring(response.content)
        self.assertTrue(root.xpath('//div[@id="error"]'))
        self.assertTrue(root.xpath('//div[@id="error"]//p')[0].text.strip() == error)
        self.assertTrue(root.xpath('//div[@id="error"]//p')[1].text.strip() == error_description)
    
    def test_get_authorise_url(self):
        response = self.client.get(reverse('get_authorise_url'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue('status' in response.json())
        self.assertEqual(response.json()['status'], 'OK')
        self.assertTrue('data' in response.json())
        self.assertTrue('authorise_url' in response.json()['data'])
    
    def test_get_person_with_get_request(self):
        response = self.client.get(reverse('get_person'))
        self.assertEqual(response.status_code, 405)
    
    def test_get_person_without_prior_get_authorise_url(self):
        response = self.client.post(reverse('get_person'))
        self.assertEqual(response.status_code, 500)
    
    def test_get_person_without_code(self):
        response = self.client.get(reverse('get_authorise_url'))
        response = self.client.post(reverse('get_person'))
        self.assertEqual(response.status_code, 500)
    
    def test_get_person_with_invalid_code(self):
        response = self.client.get(reverse('get_authorise_url'))
        response = self.client.post(reverse('get_person'), data={'code': '123'}, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue('status' in response.json())
        self.assertEqual(response.json()['status'], 'Error')
        self.assertTrue('details' in response.json())
        self.assertTrue('code' in response.json()['details'])

# Test end-to-end
class MyInfoViewSeleniumTestCase(StaticLiveServerTestCase):
    port = 3001
    
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        
        chromedriver_path = 'chromedriver/chromedriver_83.exe'
        chrome_options = webdriver.ChromeOptions()
        # comment out next line if you want to see chrome window
        chrome_options.add_argument('--headless')
        cls.webdriver = webdriver.Chrome(chromedriver_path, options=chrome_options)
    
    @classmethod
    def tearDownClass(cls):
        cls.webdriver.quit()
        super().tearDownClass()
    
    def wait_for_any_xpath(self, xpaths : list, timeout=30) -> int:
        while timeout:
            root = lxml.html.fromstring(self.webdriver.page_source)
            for i in range(len(xpaths)):
                if root.xpath(xpaths[i]):
                    return i
            time.sleep(1)
            timeout -= 1
        return -1
    
    def test_end_to_end(self):
        # load our index page
        self.webdriver.get(f'{self.live_server_url}/')
        # click "Retrieve MyInfo" button, this will bring us to authorise url page
        self.webdriver.find_element_by_xpath('//button[text()="Retrieve MyInfo"]').click()
        # just use the default id, click "Login"
        self.webdriver.find_element_by_xpath('//button[text()="Login"]').click()
        # click "I Agree" on the next page
        self.webdriver.find_element_by_xpath('//button[@id="allow"]').click()
        self.assertNotEqual(self.wait_for_any_xpath(['//div[@class="tab-content"]']), -1)
        
        root = lxml.html.fromstring(self.webdriver.page_source)
        self.assertTrue(root.xpath('//div[@class="tab-content"]/div[@id="contact"]'))
        self.assertTrue(root.xpath('//div[@class="tab-content"]/div[@id="personal"]'))
        self.assertTrue(root.xpath('//div[@class="tab-content"]/div[@id="income"]'))
    
    def test_end_to_end_user_deny(self):
        # load our index page
        self.webdriver.get(f'{self.live_server_url}/')
        # click "Retrieve MyInfo" button, this will bring us to authorise url page
        self.webdriver.find_element_by_xpath('//button[text()="Retrieve MyInfo"]').click()
        # just use the default id, click "Login"
        self.webdriver.find_element_by_xpath('//button[text()="Login"]').click()
        # click "I Agree" on the next page
        self.webdriver.find_element_by_xpath('//button[@id="deny"]').click()
        
        root = lxml.html.fromstring(self.webdriver.page_source)
        self.assertTrue(root.xpath('//div[@id="error"]'))
            
        error = root.xpath('//div[@id="error"]//p')[0].text.strip()
        error_description = root.xpath('//div[@id="error"]//p')[1].text.strip()
        self.assertEqual(error, 'access_denied')
        self.assertEqual(error_description, 'Resource Owner did not authorize the request')
