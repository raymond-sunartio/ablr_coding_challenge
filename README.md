# ablr_coding_challenge

## Overview

Use the existing code provided (or roll your own as you see fit), build a **Django-backend** application with
**React frontend** to demonstrate the integration with MyInfo APIs, similar to the Demo app provided by 
Singapore Government Technology Agency (GovTech): https://github.com/ndi-trusted-data/myinfo-demo-app

## Sequence diagram

![Sequence Diagram](https://github.com/raymond-sunartio/ablr_coding_challenge/blob/master/flow.png?raw=true)
![Sequence Diagram](./flow.png)
![Sequence Diagram](./flow.png?raw=true)

python manage.py migrate - mainly to setup session table

python manage.py runserver localhost:3001

coverage report --include="apps\myinfo\*"
https://chromedriver.chromium.org/downloads