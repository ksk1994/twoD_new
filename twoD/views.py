from django.http import HttpResponseRedirect, JsonResponse, FileResponse, HttpResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login as dj_login
from django.contrib.auth import logout as auth_logout
from django.db import IntegrityError
from django.contrib import messages
import pytz
import json
from django.utils import timezone
from django.views.decorators.http import require_POST
from django.views.decorators.http import require_http_methods
from django.db.models import Sum
from django.shortcuts import render, get_object_or_404

#import database models
from .models import User, Number, Value, Seccion, Log, Commission, ArchiveNum, ArchiveNumLog, Archive 

# Create your views here.
@login_required(login_url='/login')
def index(request):
    vals = Value.objects.filter(user=request.user).order_by('num_id')
    logs = Log.objects.filter(user=request.user).order_by('time')
    comms = Commission.objects.filter(user=request.user).order_by('name')
    return render(request, 'twoD/index.html', {
        'vals': vals,
        'logs': logs,
        'comms': comms
    })



def login_view(request):
    if request.method == 'POST':
        username = request.POST["username"]
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)

        if user is not None:
            dj_login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            messages.error(request, "Invalid username or password!")
            return redirect("login")
    else:
        return render(request, "twoD/login.html")



def register(request):
    if request.method == 'POST':
        name = request.POST['name'].strip().capitalize()
        username = request.POST['username'].strip()
        password = request.POST['password']
        confirmation = request.POST['confirmation']
        phone = request.POST['phone'].strip()
        email = 'exemple@exemple.cpm'

        #checking if password match with confirmation
        if password != confirmation:
            messages.error(request, "Passwords not match!")
            return HttpResponseRedirect(reverse("register"))

        #creating new account
        try:
            user = User.objects.create_user(username, email, password)
            user.phone = phone
            user.first_name = name
            user.save()


        except IntegrityError:
            messages.error(request, "Username already taken!")
            return redirect("register")

        nums = Number.objects.all()
        val_list = [Value(num=num, user=user, amount=0) for num in nums]
        Value.objects.bulk_create(val_list)

        dj_login(request, request.user)
        messages.success(request, 'Successfully registered!')
        return redirect('index')

    else:
        return render(request, 'twoD/register.html')


def logout_view(request):
    auth_logout(request)
    return redirect('index')



def recover(request):
    if request.method == 'POST':
        username = request.POST['username'].strip()
        password = request.POST['password']
        confirmation = request.POST['confirmation']
        code = int(request.POST['randomCode'].strip())
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            messages.error(request, 'အကောင့်နာမည် မှားနေပါတယ်!')
            return redirect('recover')

        if code != user.random_field:
            messages.error(request, 'လျှိုဝှက်နံပါတ် မှားနေပါတယ်!')
            return redirect('recover')
        if password != confirmation:
            messages.error(request, 'Password နှစ်ခုမတူပါဘူ!')
            return redirect('recover')
        user.set_password(password)
        user.save()
        dj_login(request, user)
        messages.success(request, 'Successfully recovered!')
        return redirect('index')
    else:
        return render(request, 'twoD/recover.html')


@require_POST
@login_required(login_url='/login')
def add_value(request):
    if request.user.is_authenticated:
        json_data = json.loads(request.body)
        ids = json_data.get('nums', [])
        value = json_data.get('value')
        comm = json_data.get('comm')

        vals = []
        errors = []
        if value <= 0:
            JsonResponse({
                    'error': 'Invalid value input!'
                    }, status=404)
        if comm:
            try:
                com = Commission.objects.get(pk=comm)
            except Commission.DoesNotExist:
                JsonResponse({
                    'error': 'Commission not found!'
                    }, status=404)
        for id in ids:
            try:
                val = Value.objects.get(pk=id, user=request.user)
            except Value.DoesNotExist:
                errors.append({
                    'error': 'Number Not Found!',
                    'id': id
                    })
                continue
            
            log = Log()
            if comm:
                log.comm = com
            log.user = request.user
            log.num = val.num
            log.amount = value
            log.save()
            val.amount += value
            val.save()
            vals.append({
                'val': val.serialize(),
                'log': log.serialize()
            })
        return JsonResponse({
            'vals': vals,
            'errors': errors
            }, status=201)
    
    return JsonResponse({
        'error': 'ERROR!'
        }, status=404)
        
@require_POST
@login_required(login_url='/login')
def create_comm(request):
    if request.user.is_authenticated:
        json_data = json.loads(request.body)
        name = json_data.get('name')
        rate = json_data.get('rate')
        if name and rate > 0:
            new_comm = Commission.objects.create(
            user=request.user,
            name=name,
            com_rate=rate
        )
            return JsonResponse({
                    'com': new_comm.serialize(),
                    }, status=201)
        
    return JsonResponse({
        'error': 'ERROR!'
        }, status=404)



@require_http_methods(["DELETE"])
@login_required(login_url='/login')
def deleteLog(request):
    if request.user.is_authenticated and request.method == 'DELETE':
        json_data = json.loads(request.body)
        id = json_data.get('id')
        try:
            log = Log.objects.get(pk=id)
            val = Value.objects.get(user=request.user, num=log.num)
        except Log.DoesNotExist:
            return JsonResponse({'error': 'Log not found'}, status=404)
        except Value.DoesNotExist:
            return JsonResponse({'error': 'Value not found'}, status=404)
        val.amount -= log.amount
        if val.amount >= 0: 
            val.save()
            log.delete()
            return JsonResponse({
                'val': val.serialize()
                }, status=201)
        
    return JsonResponse({
        'error': 'error'
        }, status=404)
        



@login_required(login_url='/login')
def close_entry(request):
    myanmar_tz = pytz.timezone('Asia/Yangon')
    current_time = timezone.localtime(timezone.now(), myanmar_tz)
    ampm = 'AM' if current_time.hour < 11 or (current_time.hour == 11 and current_time.minute < 59) else 'PM'

    session, created = Seccion.objects.get_or_create(ampm=ampm, date=timezone.now())
    print(session)
    print(created)
    vals = Value.objects.select_related('num').filter(user=request.user, amount__gt=0)
    comms = Commission.objects.filter(user=request.user)
    ar_nums = []
    total = 0
    transfer_amount = 0

    for val in vals:
        ar_num = ArchiveNum.objects.create(
            num=val.num,
            amount=val.amount,
            limit=val.limit
        )
        ar_logs = []

        if val.limit and val.limit < val.amount:
            transfer = val.amount - val.limit
            transfer_amount += transfer

        

        for comm in comms:
            logs = Log.objects.filter(user=request.user, num=val.num, comm=comm)

            if logs.exists():
                amount = logs.aggregate(total_amount=Sum('amount'))['total_amount'] or 0

                ar_num_log = ArchiveNumLog.objects.create(
                    comm=comm,
                    commRate=comm.com_rate,
                    amount=amount
                )

                ar_logs.append(ar_num_log)
                logs.delete()

        logs = Log.objects.filter(user=request.user, num=val.num, comm=None)

        if logs.exists():
            amount = logs.aggregate(total_amount=Sum('amount'))['total_amount'] or 0

            ar_num_log = ArchiveNumLog.objects.create(
                comm=None,
                commRate=0,
                amount=amount
            )

            ar_logs.append(ar_num_log)
            logs.delete()

        ar_num.archiveLog.set(ar_logs)
        ar_nums.append(ar_num)
        total += val.amount

    Value.objects.filter(user=request.user).update(amount=0, limit=None)

    archive = Archive.objects.create(
        user=request.user,
        session=session,
        total=total,
        transfer=transfer_amount
    )

    archive.archiveNum.set(ar_nums)

    return JsonResponse({'arc': archive.serialize()}, status=201)



@login_required(login_url='/login')
def get_arcs(request):
    arcs = Archive.objects.filter(user=request.user, jp=None).values('id', 'session__date', 'session__ampm')
    arcs_json = list(arcs)

    return JsonResponse({'arcs': arcs_json}, status=200)



@login_required(login_url='/login')
def add_jp(request):
    json_data = json.loads(request.body)
    jp = json_data.get('jp')
    arc_id = json_data.get('arc')

    try:
        jp_num = Number.objects.get(pk=jp)
        arc = Archive.objects.select_related('session').get(user=request.user, pk=arc_id)
    except (Number.DoesNotExist, Archive.DoesNotExist):
        return JsonResponse({'error': 'Number or Archive not found'}, status=404)

    arc.jp = jp_num
    arc.save()

    response_data = {'arc': arc.serialize()}

    return JsonResponse(response_data, status=201)

@login_required(login_url='/login')
def history(request, id):
    arc = get_object_or_404(Archive, user=request.user, pk=id)
    return render(request, 'twoD/history.html', {'arc': arc})


@login_required(login_url='/login')
def change_comm(request):
    if request.method == 'PUT':
        json_data = json.loads(request.body)
        id = json_data.get('id')
        rate = json_data.get('rate')
        if id == 'Owner':
            comm = request.user
        else:
            try:
                comm = Commission.objects.get(pk=id)
            except Commission.DoesNotExist:
                return JsonResponse({
                    'error': 'error'
                    }, status=404)
        comm.com_rate = rate / 100
        comm.save()
        return JsonResponse({
            'comm': comm.serialize()
        }, status=201)

    return JsonResponse({'error': 'Invalid request method'}, status=400)



@login_required(login_url='/login')
def set_limit(request):
    if request.method == 'PUT':
        json_data = json.loads(request.body)
        id = json_data.get('num')
        limit = json_data.get('limit')
        if id == 'allNums':
            vals = Value.objects.filter(user=request.user)
        else:
            vals = Value.objects.filter(user=request.user, pk=id)
        
        if vals.exists():
            vals.update(limit=None if limit == 0 else limit)
        
        response_data = {'vals': [val.serialize() for val in vals]}

        return JsonResponse(response_data, status=201)
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)
    

@login_required(login_url='/login')
def get_session(request):
    
    arcs = Archive.objects.filter(user=request.user).order_by('-id')
    
    sessions = [{'id': arc.id,
                 'session': arc.session.serialize()} for arc in arcs]

    return JsonResponse({
            'sess': sessions
        }, status=201)