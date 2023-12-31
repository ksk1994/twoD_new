# Generated by Django 4.2.2 on 2023-07-02 07:59

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('twoD', '0006_alter_seccion_ampm'),
    ]

    operations = [
        migrations.CreateModel(
            name='Value',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.IntegerField()),
                ('transfer', models.IntegerField(default=0)),
                ('num', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ValueNumber', to='twoD.number')),
                ('session', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ValueSession', to='twoD.seccion')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ValueUser', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
