# Generated by Django 4.2.2 on 2023-07-02 07:40

from django.db import migrations, models
import twoD.models


class Migration(migrations.Migration):

    dependencies = [
        ('twoD', '0002_user_phone_user_random_field'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='random_field',
            field=models.IntegerField(default=twoD.models.generate_random_four_digits),
        ),
    ]
