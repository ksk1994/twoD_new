# Generated by Django 4.2.2 on 2023-07-13 02:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('twoD', '0016_alter_archivenumlog_commrate'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='commRate',
            field=models.FloatField(default=0),
        ),
    ]
