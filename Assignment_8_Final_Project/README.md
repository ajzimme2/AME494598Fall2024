# Beginning of README File
Instead of using the orginially intended devices I listed in my BOM, I have been provided a 'Quatro' by the professor for input data. 

## Summary of Project
The intent of the project is to create a cheap/affordable version of a golf swing sensor, since the currently available ones retail for hundreds to thousands of dollars. The main form for the project was mean for the sensor to be attached to the club, more towards the handle end, but not so far up that it would interfere with the use of the club. The project in its current state is **Unfinished** with the intent to eventually continue its development after the new year. Some of the roadblocks that have been encountered are mentioned in the *Improvements and Issues* section. 

## Installation Instructions
### Approach for Installation
Firstly, it is important that you, the user, has identified a method for serving the files contained within this repo to the internet. Whether that be through AWS or by other means, so be it. I will go through the steps of setting up and the installation through the AWS platform. 
1. Open AWS in your browsing window, and navigate to the Console Home page. 
[AWS_Console_Home](https://us-east-1.console.aws.amazon.com/console/home?region=us-east-1#)
![AWS_Homepage](AWS_Homepage.JPG)
2. Search and select **EC2**, then select the orange button labelled *Launch instance*.
![Launch Instance](Launch_Instance.JPG)
3. The next steps will set up the instance parameters, change these based on need, but the key ones used for now will be under the following headers: **Application and OS Images**, **Key pair**, and **Configure Storage**.
    1. Under **Application and OS Images** select the *Ubuntu* option.
    2. Under **Key pair** select from the drop down menu, *proceed without key pair*.
    3. Under **Configure Storage** change the storage value to 28 GiB gp3.
    4. Then click the orange *Launch Instance* button on the lower right hand side.
4. After that, wait for the page to finish loading and then click on the link within the green box
![Instance_Made](Instance_Made.JPG)
5. From the new page, make sure the instance is selected by checking the box next to the instance name. Then press the connect button, then scroll down and press the connect button again.
![Instance_MainPage](Instance_MainPage.JPG)
6. In the next window that opens, the instance window, begin by pasting in the follwing code and pressing y and enter whenever prompted:
```
{
sudo apt-get install gnupg curl

curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
   --dearmor
   
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list

sudo apt update
sudo apt-get install -y mongodb-org
sudo apt install nodejs npm 
sudo npm install -g forever http-server n

npm install mongodb@3.6
sudo service mongod start
}
```
7. Clone this repository into the instance environment. 
8. Next head back into the *Instances* window and select the instance, then scroll down and click on the *Security* tab. Click on the link that appears under the **Security Groups** header. 
![Security_Page](Security_Page.JPG)
9. On this new page, click the button that says *Edit inbound rules*, the *Add rule*, and change the port to *8080*, and specify the source to be *0.0.0.0/0* and then click save. 
![Inbound_Rules_Page](Inbound_Rules_Page.JPG)
10. Back in the instance window (where we have pasted lines of code), navigate through the repository to the file named *server.js* under the server folder. Then type in `node server.js`
11. This completes the relevant approach for installation.

## Usage Instructions
Navigate to the webage that has been established by running the `node server.js` command from step 11 in the *Approach for Installation* section and click on the connect button. After that select the bluetooth device (quatro) you want to connect (make sure your bluetooth on your computer is on) and click pair. CONTINUE FROM HERE

## Statement of Need(s)/Improvements and Issues
### Statement of Need(s)
The main drive behind this project has been to be able to provide a cost effective tool for individuals who do not have the same access to expensive equipment. This project was aimed to tackle that barrier, and provide it through open-source methods so that there is EQUAL access to all parties that want to take use of it. As a college student who has been trying to develop this, it makes perfect sense, since typical college students lack additional funds to spend on their hobbies and interests. Furthermore, youth of today have more experience with technology, so by providing this project through means they are more comfortable with (the internet, electronic devices, etc.) it also bridges the age gap for learning among golfers. 

### Improvements & Issues
#### Client to Server
##### Problem
I have had issues trying to pass the relevant data (accelerometer and gyroscope readings) to the server, mainly due to being unfamilar with the quatro's initial setup and used libraries.
##### Solution
Read up more about the various libraries the quatro uses to become familar with its syntax and dependencies. Furthermore, should consult with the professor on implementation of the client server connection.

#### Bluetooth
##### Problem
I had trouble connecting the quatro to bluetooth when I wanted to send the data to my server. Without the data I can not make the modifications I need and serve up the final product onto a webpage. 
##### Solution
Ask the professor more about the web bluetooth connection and try to research online about how it works so that there is I have a better understanding. 

### Future Outlook
If I could get all the pieces to work together as intended I could see this project expanding into further sports markets. It would be fun and beneficial to many to see this project adapted into baseball, disk golf, lacrosse, and other sports. I would assume that a baseball centered project would entail mostly the same details, same for lacrosse, but disk golf would need integration into a glove for the user to wear. 

## Demos

