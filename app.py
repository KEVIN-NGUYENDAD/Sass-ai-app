from flask import Flask, request, render_template_string
from agent import ai_agent

app = Flask(__name__)

HTML = """
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>💊 Hương Pharmacy AI Copilot</title>

<style>

body{
    background:#f4f7f9;
    font-family:"Segoe UI",Tahoma,Geneva,Verdana,sans-serif;
}

.container{
    width:85%;
    margin:auto;
    padding:20px;
}

h1{
    color:#0f766e;
    font-size:48px;
}

.subtitle{
    font-size:22px;
    margin-bottom:20px;
}

textarea{
    width:100%;
    height:180px;
    padding:15px;
    border-radius:10px;
    border:1px solid #ccc;
    font-size:18px;
}

button{
    
