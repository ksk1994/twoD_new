from django.contrib import admin
from .models import User, Number, Value, Commission, Log, ArchiveNum, ArchiveNumLog, Archive, Seccion
# Register your models here.

admin.site.register(User)
admin.site.register(Number)
admin.site.register(Value)
admin.site.register(Commission)
admin.site.register(Log)
admin.site.register(ArchiveNum)
admin.site.register(ArchiveNumLog)
admin.site.register(Archive)
admin.site.register(Seccion)

