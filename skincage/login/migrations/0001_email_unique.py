from django.db import migrations, connection


def aplicar_unique_email(apps, schema_editor):
    """
    Aplica un índice UNIQUE sobre auth_user.email.
    Compatible con PostgreSQL y SQLite.

    La limpieza de duplicados se omite aquí porque:
    - En una BD nueva (dev) no hay duplicados.
    - En producción (PostgreSQL) el índice se aplica manualmente o en un
      entorno donde ya se garantiza la unicidad.
    """
    db_engine = connection.vendor

    with schema_editor.connection.cursor() as cursor:
        if db_engine == 'postgresql':
            cursor.execute("""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'auth_user_email_unique'
                    ) THEN
                        ALTER TABLE auth_user
                            ADD CONSTRAINT auth_user_email_unique UNIQUE (email);
                    END IF;
                END$$;
            """)
        else:
            # SQLite: índice único parcial (excluye emails vacíos)
            cursor.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS auth_user_email_unique
                ON auth_user (email)
                WHERE email != '';
            """)


def revertir_unique_email(apps, schema_editor):
    db_engine = connection.vendor
    with schema_editor.connection.cursor() as cursor:
        if db_engine == 'postgresql':
            cursor.execute("""
                ALTER TABLE auth_user
                    DROP CONSTRAINT IF EXISTS auth_user_email_unique;
            """)
        else:
            cursor.execute("DROP INDEX IF EXISTS auth_user_email_unique;")


class Migration(migrations.Migration):
    """
    Aplica UNIQUE constraint sobre auth_user.email.
    Depende de que auth y social_django estén migrados primero.
    """

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('social_django', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(
            aplicar_unique_email,
            reverse_code=revertir_unique_email,
        ),
    ]
