# Generated by Django 4.2.2 on 2023-07-13 02:26

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('twoD', '0017_user_commrate'),
    ]

    operations = [
        migrations.RenameField(
            model_name='user',
            old_name='commRate',
            new_name='com_rate',
        ),
    ]
