#!/usr/bin/env python2
#!---coding=utf8---
from contextlib import closing
import hashlib
from functools import wraps
from flask import Flask,request,session,g,redirect,url_for,abort,render_template,flash,jsonify

import MySQLdb
from MySQLdb.cursors import DictCursor

app = Flask(__name__)
app.debug='True'
app.config.from_object("baeconfig")
app.secret_key=app.config["SECRET_KEY"]


def connect_db():
    return MySQLdb.connect(host=app.config["DBHOST"],port=app.config["DBPORT"],user=app.config["DBUSER"],passwd=app.config["DBPASSWD"],db=app.config["DBNAME"],charset='utf8')


def init_db():
    with closing(connect_db()) as db:
        with closing(app.open_resource('server.sql',mode='r')) as f:
            with closing(db.cursor(cursorclass=DictCursor)) as cursor:
                cmd=''
                for line in f:
                    if not line:
                        break
                    line=line.strip()
                    if not line or line[0:2]=='--':
                        continue
                    cmd+=line
                    if line[-1]==';':
                        cursor.execute(cmd)
                        cmd=''

        db.commit()


@app.before_request
def before_request():
    g.db=connect_db()
    g.cursor=g.db.cursor(cursorclass=DictCursor)
    user_id=session.get('id')
    username=session.get('username')
    passwd=session.get('passwd')
    if username and passwd and user_id:
        g.cursor.execute("SELECT * FROM users WHERE id=%s AND name=%s AND passwd=%s",(user_id,username,passwd))
        g.user=g.cursor.fetchone()
    else:
        g.user=None

@app.teardown_request
def teardown_request(exception):
    g.cursor.close()
    g.db.close()



def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('logged_in') is not True or not g.user:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function



def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        g.cursor.execute("SELECT value FROM settings WHERE name='admin'")
        admin=g.cursor.fetchone()['value']
        if g.user['name']!=admin:
            return redirect('/')
        return f(*args, **kwargs)
    return decorated_function


@app.route('/install',methods=['GET','POST'])
def install():
    g.cursor.execute("SHOW TABLES")
    tables=g.cursor.fetchall()
    if len(tables)==4:
        needCreateTable=False
        g.cursor.execute("SELECT * FROM users WHERE name=(SELECT value FROM settings WHERE name='admin')")
        admin=g.cursor.fetchone()
        if admin:
            return redirect('/login')
    else:
        needCreateTable=True
    if request.method=='GET':
        return render_template('install.html')
    if request.method=='POST':
        if needCreateTable:
            init_db()
        admin=request.form.get('username')
        passwd=request.form.get('passwd')
        usingMode=request.form.get('usingMode')
        if not admin or not passwd or not usingMode:
            abort(400)

        g.cursor.execute("INSERT INTO users(name,passwd) VALUES(%s,%s)",(admin,hashlib.md5(passwd).hexdigest()))
        g.cursor.execute("INSERT INTO settings(name,value) VALUES(%s,%s)",('admin',admin))
        g.cursor.execute("INSERT INTO settings(name,value) VALUES(%s,%s)",('usingMode',usingMode))
        g.db.commit()
        #session['logged_in']=True
        #session['username']=admin
        #session['passwd']=passwd
        return redirect('/')


@app.route('/img')
def img():
    return render_template('imglist.html')

@app.route('/sign',methods=['POST'])
def sign():
    if g.user:
        return redirect('/')
    g.cursor.execute("SELECT value FROM settings WHERE name='usingMode'")
    usingMode=g.cursor.fetchone()
    if usingMode=='single':
        return 'forbids sign in single user mode'
    username=request.form.get('username')
    passwd=request.form.get('passwd')
    email=request.form.get('email') # not use
    g.cursor.execute("SELECT * FROM users WHERE name=%s",username)
    if g.cursor.fetchone():
        return "error to do"
    g.cursor.execute("INSERT INTO users(name,passwd) VALUES(%s,%s)",(username,hashlib.md5(passwd).hexdigest()))
    g.db.commit()
    #session['logged_in']=True
    #session['username']=username
    return redirect('/login')


@app.route('/login',methods=['GET','POST'])
def login():
    if g.user:
        return redirect('/')
    if request.method=='GET':
        return render_template('login.html')
    if request.method=='POST':
        username=request.form.get('username')
        passwd=request.form.get('passwd')
        if not username or not passwd:
            abort(400)
        g.cursor.execute("SELECT * FROM users WHERE name=%s AND passwd=%s",(username,hashlib.md5(passwd).hexdigest()))
        user=g.cursor.fetchone()
        if not user:
            #return jsonify({'rep':'error'})
            return redirect('/login')
        else:
            session['logged_in']=True
            session['id']=user['id']
            session['username']=user['name']
            session['passwd']=user['passwd']
            #return json.jsonify({'rep':'ok'})
            return redirect('/')


@app.route('/logout')
@login_required
def logout():
    session.pop('username',None)
    session.pop('logged_in',None)
    session.pop('id',None)
    return redirect('/login')

@app.route('/')
@login_required
def index():
    isAjax=request.args.get('from')
    if isAjax=='ajax':
        g.cursor.execute("SELECT id,url,title FROM wishes_user,wishes WHERE user_id=%s AND wish_id=id",g.user['id'])
        wishes=g.cursor.fetchall()
        data={}
        for w in wishes:
            data[w['id']]=w
        return jsonify(data)
    else:
        return render_template('index.html')




@app.route('/list')
@login_required
def list():
    g.cursor.execute("SELECT id,url,img,title,website FROM wishes_user,wishes WHERE user_id=%s AND wish_id=id",g.user['id'])
    wishes=g.cursor.fetchall()
    data={}
    for w in wishes:
        data[w['url']]=w
    return jsonify(data)


@app.route('/add',methods=['POST'])
@login_required
def add():
    url=request.form.get('url')
    title=request.form.get('title')
    img=request.form.get('img')
    if not url or not title:
        abort(400)
    website=url.split('.')[1]
    g.cursor.execute("SELECT id FROM wishes WHERE url=%s",url)
    if g.cursor.fetchone():
        return jsonify({"rep":"duplicated"})
    g.cursor.execute("INSERT INTO wishes(url,img,title,website) VALUES(%s,%s,%s,%s)",(url,img,title,website))
    g.cursor.execute("SELECT id FROM wishes WHERE url=%s",url)
    wish_id=g.cursor.fetchone()['id']
    g.cursor.execute("INSERT INTO wishes_user(wish_id,user_id) VALUES(%s,%s)",(wish_id,g.user['id']))
    g.db.commit()
    return jsonify({'rep':'ok'})

@app.route('/delete',methods=['POST'])
@login_required
def delete():
    url=request.form.get('url')
    g.cursor.execute("SELECT id FROM wishes WHERE url=%s",url)
    wish_id=g.cursor.fetchone()['id']
    g.cursor.execute("DELETE FROM wishes_user WHERE wish_id=%s AND user_id=%s",(wish_id,g.user['id']))
    g.cursor.execute("DELETE FROM wishes WHERE id=%s",wish_id)
    g.db.commit()
    return jsonify({'rep':'ok'})


@app.route('/admin',methods=['GET','POST'])
@login_required
@admin_required
def admin():
    g.cursor.execute("SELECT value FROM settings WHERE name='usingMode'")
    usingMode=g.cursor.fetchone()
    if usingMode=='single':
        return "only you exist,don't need admin"

    if request.method=='GET':
        g.cursor.execute("SELECT * FROM users WHERE name!=%s",g.user['name'])
        users=g.cursor.fetchall()
        return render_template('admin.html',users=users)




@app.route('/settings',methods=['GET','POST'])
@login_required
@admin_required
def settings():
    g.cursor.execute("SELECT value FROM settings WHERE name='usingMode'")
    usingMode=g.cursor.fetchone()
    if request.method=='GET':
        return render_template('settings.html',usingMode=usingMode)
    if request.method=='POST':
        oldpasswd=request.form.get('oldpasswd')
        newpasswd=request.form.get('newpasswd')
        newMode=request.form.get('usingMode')
        if not oldpasswd or not newpasswd or not newMode:
            abort(400)
        if oldpasswd!=newpasswd:
            g.cursor.execute("UPDATE users SET passwd=%s WHERE name=%s AND passwd=%s",(newpasswd,g.user['name'],hashlib.md5(oldpasswd).hexdigest()))
        if usingMode!=newMode:
            g.cursor.execute("UPDATE settings SET value=%s WHERE name=%s",(newMode,'usingMode'))
        g.db.commit()
        return redirect('/settings')



#from bae.core.wsgi import WSGIApplication

#application = WSGIApplication(app)

if __name__ == '__main__':
    app.run()
