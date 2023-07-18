from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import random
import pytz

def generate_random_four_digits():
    while True:
        # Generate a random four-digit integer
        random_number = random.randint(1000, 9999)
        
        # Check if the generated number is unique
        if not User.objects.filter(random_field=random_number).exists():
            return random_number

def getAmPm():
    myanmar_tz = pytz.timezone('Asia/Yangon')
    current_time = timezone.localtime(timezone.now(), myanmar_tz)
    return 'AM' if current_time.hour < 11 or (current_time.hour == 11 and current_time.minute < 59) else 'PM'

class User(AbstractUser):
    phone = models.IntegerField(blank=True, null=True)
    random_field = models.IntegerField(default=generate_random_four_digits)
    com_rate = models.FloatField(default=0)

    def __str__(self):
        return f"{self.id}: ({self.username})"

    def serialize(self):
        return {
            'id': self.id,
            'email': self.email,
            'user': self.username,
            'name': self.first_name,
            'com_rate': self.com_rate,
        }

class Number(models.Model):
    num = models.CharField(max_length=3)
    

    def __str__(self):
        return f"({self.id}): {self.num}"
    

    def serialize(self):
        return {
            'id': self.id,
            'num': self.num,
            
        }

class Seccion(models.Model):
    date = models.DateField(default=timezone.now)
    ampm = models.CharField(max_length=3, default=getAmPm)

    def __str__(self):
        return f"({self.id}): {self.date}({self.ampm})"
    
    def serialize(self):
        return {
            'id': self.id,
            'date': self.date,
            'ampm': self.ampm
            
        }


class Value(models.Model):
    user = models.ForeignKey('User', models.CASCADE, related_name='ValueUser')
    num = models.ForeignKey('Number', models.CASCADE, related_name='ValueNumber')
    amount = models.IntegerField()
    limit = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return f"({self.id}): {self.user.username}({self.num.num})"
    
    def serialize(self):
        limit = 'None'
        if self.limit is not None:
            limit = self.limit
        return {
            'id': self.id,
            'user': self.user.username,
            'num': self.num.serialize(),
            'amount': self.amount,
            'limit': limit
            
        }


class Commission(models.Model):
    user = models.ForeignKey('User', models.CASCADE, related_name='CommissionUser')
    name = models.CharField(max_length=50)
    com_rate = models.FloatField()

    def __str__(self):
        return f"({self.id}): {self.user.username}({self.name})"
    
    def serialize(self):
        return {
            'id': self.id,
            'user': self.user.username,
            'name': self.name,
            'com_rate': self.com_rate,
        }

class Log(models.Model):
    user = models.ForeignKey('User', models.CASCADE, related_name='LogUser')
    comm = models.ForeignKey('Commission', models.CASCADE, related_name='CommUser', blank=True, null=True)
    num = models.ForeignKey('Number', models.CASCADE, related_name='LogNum')
    amount = models.IntegerField()
    time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        com = ''
        if self.comm is not None:
            com = self.comm.name
        return f"({self.id}): {self.user.username}|{com}|{self.num.num}|{self.amount}"
    
    def serialize(self):
        com = {}
        if self.comm is not None:
            com = self.comm.serialize()
        return {
            'id': self.id,
            'user': self.user.username,
            'comm': com,
            'num': self.num.serialize(),
            'amount': self.amount,
            'time': self.time.strftime("%I:%M %p"),
        }


class ArchiveNum(models.Model):
    num = models.ForeignKey('Number', models.CASCADE, related_name='ArchiveNumNum')
    amount = models.IntegerField()
    limit = models.IntegerField(blank=True, null=True)
    archiveLog = models.ManyToManyField('ArchiveNumLog', related_name='archive_logs')

    def serialize(self):
        return {
            'id': self.id,
            'num': self.num.serialize(),
            'amount': self.amount,
            'limit': self.limit,
            'arLogs': [log.serialize() for log in self.archiveLog.all()],
        }




class ArchiveNumLog(models.Model):
    comm = models.ForeignKey('Commission', models.CASCADE, related_name='ArchiveNumLogComm', blank=True, null=True)
    amount = models.IntegerField()
    commRate = models.FloatField(default=0)

    def serialize(self):
        com = {}
        if self.comm is not None:
            com = { 'id':self.comm.name, 'name':self.comm.name,}
        return {
            'id': self.id,
            'comm': com,
            'rate': self.commRate,
            'amount': self.amount,
        }

class Archive(models.Model):
    user = models.ForeignKey('User', models.CASCADE, related_name='ArchiveUser')
    archiveNum = models.ManyToManyField('ArchiveNum', related_name='ArchiveNums')
    session = models.ForeignKey('Seccion', models.CASCADE, related_name='ArchiveSession')
    jp = models.ForeignKey('Number', models.CASCADE, related_name='ArchiveJP', blank=True, null=True)
    total = models.IntegerField()
    transfer = models.IntegerField()

    def serialize(self):
        jp = {}
        if self.jp is not None:
            jp = self.jp.serialize()
        return {
            'id': self.id,
            'user': self.user.username,
            'arNums': [num.serialize() for num in self.archiveNum.all()],
            'session': self.session.serialize(),
            'jp': jp,
            'total': self.total,
            'transfer': self.transfer,
        }



