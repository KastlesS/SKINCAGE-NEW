from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_alter_user_options_profile'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='avatar',
            field=models.ImageField(
                blank=True,
                help_text='Imagen de perfil del usuario',
                null=True,
                upload_to='avatars/',
                verbose_name='Foto de perfil',
            ),
        ),
    ]
