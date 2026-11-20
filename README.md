# 🛒 CloudCart
### Cloud-Based E-Commerce Platform | Built with Amazon Web Services

CloudCart is a cloud-based e-commerce application that allows customers to browse products, add items to a cart and place orders. It also includes an admin dashboard for managing products.

<p align="center">
  <img src="screenshots/cloudcart_architecture.png" alt="CloudCart AWS Architecture" width="850">
</p>

---

## 📌 About the Project

CloudCart is an e-commerce project developed using Amazon Web Services (AWS).

Customers can browse products, manage their shopping cart and place orders. The admin dashboard allows administrators to add, update and delete products.

AWS services are used to host the application, store data and images, process orders and send notifications.

## ☁️ AWS Services Used

| AWS Service | Purpose |
|:---|:---|
| **Amazon EC2** | Hosts the application |
| **Amazon S3** | Stores product images |
| **Amazon RDS (MySQL)** | Stores product and order details |
| **AWS Lambda** | Processes orders |
| **Amazon SNS** | Sends order notifications |
| **Amazon SES** | Sends confirmation emails |
| **AWS IAM** | Manages permissions |
| **Application Load Balancer** | Distributes incoming traffic |
| **EC2 Auto Scaling** | Adjusts the number of EC2 instances |

## ⚙️ Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python, Flask
- **Database:** MySQL
- **Web Server:** Nginx and Gunicorn
- **Cloud Platform:** Amazon Web Services (AWS)

## ✨ Key Features

- View available products and prices.
- Add products to the shopping cart.
- Place orders.
- Admin login and dashboard.
- Add, update and delete products.
- Upload product images to Amazon S3.
- Store product and order details in Amazon RDS.
- Process orders using AWS Lambda.
- Send notifications using SNS and SES.
- Manage application traffic using Load Balancer and Auto Scaling.

## 🔄 Application Workflow

1. Customers open the CloudCart website.
2. The Load Balancer distributes incoming requests to EC2 instances.
3. EC2 hosts the application and runs the Flask backend.
4. Product details are stored in Amazon RDS.
5. Product images are stored in Amazon S3.
6. When a customer places an order, AWS Lambda processes it.
7. SNS sends order notifications.
8. SES sends customer confirmation emails.

## 🏗️ Deployment

- Deployed the application on Amazon EC2.
- Used Nginx and Gunicorn to run the application.
- Connected the application to Amazon RDS.
- Configured Amazon S3 for image storage.
- Set up an Application Load Balancer.
- Configured EC2 Auto Scaling.


## 🚀 Future Improvements

- Customer registration and login.
- Online payment integration.
- Order history and tracking.
- Product search and filtering.
- Improved monitoring.

## 🎯 Project Objectives

- Learn how to use AWS services in a real project.
- Understand cloud-based application deployment.
- Connect a Python application with AWS services.
- Learn serverless order processing.
- Understand Load Balancing and Auto Scaling.
- Gain practical experience with cloud security.

## 👨‍💻 Author

**Adithya T S**

GitHub: [CloudCart – AWS E-Commerce Platform](https://github.com/adithyats11-wq/CloudCart-AWS-Ecommerce)

---

<p align="center">
  <b>CloudCart — Bringing E-Commerce and Cloud Computing Together.</b>
</p>