import os
import shutil
import zipfile
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
from apps.projects.models import Project

def get_safe_project_path(user, project_name, subpath=''):
    """
    Prevents path traversal attacks by ensuring target absolute path stays strictly inside project folder.
    """
    base_dir = os.path.abspath(os.path.join(settings.PROJECTS_STORAGE_ROOT, user.username, project_name))
    os.makedirs(base_dir, exist_ok=True)

    if not subpath or subpath == '/':
        return base_dir, base_dir

    # Clean subpath
    subpath = subpath.lstrip('/\\')
    target_path = os.path.abspath(os.path.join(base_dir, subpath))

    # Verify target path starts with base_dir
    common = os.path.commonpath([base_dir, target_path])
    if common != base_dir:
        raise PermissionError("Access denied: Directory traversal detected.")

    return base_dir, target_path

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_files_view(request, project_id):
    try:
        project = Project.objects.get(id=project_id, owner=request.user)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

    subpath = request.query_params.get('path', '')
    try:
        base_dir, target_path = get_safe_project_path(request.user, project.name, subpath)
    except PermissionError as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)

    if not os.path.exists(target_path):
        return Response({'error': 'Target path does not exist.'}, status=status.HTTP_404_NOT_FOUND)

    items = []
    try:
        with os.scandir(target_path) as entries:
            for entry in entries:
                rel_path = os.path.relpath(entry.path, base_dir).replace('\\', '/')
                items.append({
                    'name': entry.name,
                    'path': rel_path,
                    'is_directory': entry.is_dir(),
                    'size': entry.stat().st_size if entry.is_file() else 0,
                    'updated_at': entry.stat().st_mtime
                })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    items.sort(key=lambda x: (not x['is_directory'], x['name'].lower()))

    curr_rel = os.path.relpath(target_path, base_dir).replace('\\', '/')
    if curr_rel == '.':
        curr_rel = ''

    return Response({
        'current_path': curr_rel,
        'files': items
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def file_content_view(request, project_id):
    try:
        project = Project.objects.get(id=project_id, owner=request.user)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

    file_path_param = request.query_params.get('path', '') if request.method == 'GET' else request.data.get('path', '')
    try:
        base_dir, target_path = get_safe_project_path(request.user, project.name, file_path_param)
    except PermissionError as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        if not os.path.isfile(target_path):
            return Response({'error': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            with open(target_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return Response({'path': file_path_param, 'content': content})
        except UnicodeDecodeError:
            return Response({'error': 'Binary file cannot be edited in text mode.'}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'POST':
        content = request.data.get('content', '')
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        with open(target_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return Response({'message': 'File saved successfully.', 'path': file_path_param})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_item_view(request, project_id):
    try:
        project = Project.objects.get(id=project_id, owner=request.user)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

    item_name = request.data.get('name', '').strip()
    is_dir = request.data.get('is_directory', False)
    parent_path = request.data.get('parent_path', '')

    if not item_name:
        return Response({'error': 'Item name is required.'}, status=status.HTTP_400_BAD_REQUEST)

    subpath = os.path.join(parent_path, item_name)
    try:
        base_dir, target_path = get_safe_project_path(request.user, project.name, subpath)
    except PermissionError as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)

    if os.path.exists(target_path):
        return Response({'error': 'An item with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    if is_dir:
        os.makedirs(target_path, exist_ok=True)
    else:
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        with open(target_path, 'w', encoding='utf-8') as f:
            f.write('')

    return Response({'message': f"{'Directory' if is_dir else 'File'} created.", 'path': subpath})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_item_view(request, project_id):
    try:
        project = Project.objects.get(id=project_id, owner=request.user)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

    target_subpath = request.data.get('path', '')
    try:
        base_dir, target_path = get_safe_project_path(request.user, project.name, target_subpath)
    except PermissionError as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)

    if not os.path.exists(target_path):
        return Response({'error': 'Item does not exist.'}, status=status.HTTP_404_NOT_FOUND)

    if target_path == base_dir:
        return Response({'error': 'Cannot delete root project directory.'}, status=status.HTTP_400_BAD_REQUEST)

    if os.path.isdir(target_path):
        shutil.rmtree(target_path)
    else:
        os.remove(target_path)

    return Response({'message': 'Item deleted successfully.'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_file_view(request, project_id):
    try:
        project = Project.objects.get(id=project_id, owner=request.user)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

    file_obj = request.FILES.get('file')
    dest_path = request.data.get('parent_path', '')

    if not file_obj:
        return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

    target_subpath = os.path.join(dest_path, file_obj.name)
    try:
        base_dir, target_path = get_safe_project_path(request.user, project.name, target_subpath)
    except PermissionError as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)

    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    with open(target_path, 'wb+') as destination:
        for chunk in file_obj.chunks():
            destination.write(chunk)

    # Extract if ZIP
    is_zip = file_obj.name.lower().endswith('.zip')
    if is_zip and request.data.get('extract_zip', 'false').lower() == 'true':
        try:
            with zipfile.ZipFile(target_path, 'r') as zip_ref:
                zip_ref.extractall(os.path.dirname(target_path))
            os.remove(target_path)
            return Response({'message': 'ZIP uploaded and extracted successfully.'})
        except Exception as e:
            return Response({'message': 'File uploaded, but failed to extract ZIP.', 'error': str(e)})

    return Response({'message': 'File uploaded successfully.', 'path': target_subpath})
