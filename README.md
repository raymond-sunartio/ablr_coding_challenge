# ablr_coding_challenge

## Overview

Use the existing code provided (or roll your own as you see fit), build a **Django-backend** application with
**React frontend** to demonstrate the integration with MyInfo APIs, similar to the Demo app provided by 
Singapore Government Technology Agency (GovTech): https://github.com/ndi-trusted-data/myinfo-demo-app

## Sequence Diagram

![Sequence Diagram](./flow.png)

## How to Run

Install all the required modules:

```
pip install -r requirements
```

Run migration (mainly to setup the session table):

```
python manage.py migrate
```

Run Django development server on port 3001:

```
python manage.py runserver localhost:3001
```

Open your favourite web browser and go to:

```
http://localhost:3001
```

## Sample Screenshots

![Contact Info](./contact_info.png)
![Personal Info](./personal_info.png)
![Income Info](./income_info.png)


coverage report --include="apps\myinfo\*"
https://chromedriver.chromium.org/downloads