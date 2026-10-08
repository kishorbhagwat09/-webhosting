import secrets
import string
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import UserDatabase

def generate_random_password(length=16):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def database_list_create_view(request):
    if request.method == 'GET':
        dbs = UserDatabase.objects.filter(owner=request.user)
        data = [{
            'id': db.id,
            'name': db.name,
            'db_name': db.db_name,
            'db_user': db.db_user,
            'db_password': db.db_password,
            'host': db.host,
            'port': db.port,
            'connection_string': db.connection_string(),
            'created_at': db.created_at,
        } for db in dbs]
        return Response(data)

    elif request.method == 'POST':
        name = request.data.get('name', '').strip()
        if not name:
            return Response({'error': 'Database display name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        clean_name = "".join(c for c in name if c.isalnum() or c == '_').lower()
        db_name = f"db_{request.user.username.lower()}_{clean_name}"
        db_user = f"usr_{request.user.username.lower()}_{clean_name}"[:16]
        db_password = generate_random_password()

        if UserDatabase.objects.filter(db_name=db_name).exists():
            return Response({'error': f'Database "{name}" already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        user_db = UserDatabase.objects.create(
            owner=request.user,
            name=name,
            db_name=db_name,
            db_user=db_user,
            db_password=db_password,
            host='127.0.0.1',
            port=3306
        )

        return Response({
            'id': user_db.id,
            'name': user_db.name,
            'db_name': user_db.db_name,
            'db_user': user_db.db_user,
            'db_password': user_db.db_password,
            'host': user_db.host,
            'port': user_db.port,
            'connection_string': user_db.connection_string(),
            'message': 'MySQL database provisioned successfully!'
        }, status=status.HTTP_201_CREATED)

@api_view(['DELETE', 'POST'])
@permission_classes([IsAuthenticated])
def database_detail_view(request, db_id):
    try:
        user_db = UserDatabase.objects.get(id=db_id, owner=request.user)
    except UserDatabase.DoesNotExist:
        return Response({'error': 'Database not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        user_db.delete()
        return Response({'message': 'MySQL database deleted successfully.'})

    elif request.method == 'POST':
        # Action: reset password
        new_pass = generate_random_password()
        user_db.db_password = new_pass
        user_db.save()
        return Response({
            'message': 'Password reset successful.',
            'db_password': new_pass,
            'connection_string': user_db.connection_string()
        })
