# Generated by Django 4.2.2 on 2023-07-02 07:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('twoD', '0003_alter_user_random_field'),
    ]

    operations = [
        migrations.CreateModel(
            name='Number',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('num', models.CharField(max_length=3)),
            ],
        ),
    ]
