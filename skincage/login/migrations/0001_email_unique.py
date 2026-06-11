from django.db import migrations, connection


def aplicar_unique_email(apps, schema_editor):
    """
    Aplica UNIQUE constraint sobre auth_user.email.
    Compatible con PostgreSQL y SQLite.
    Limpia duplicados conservando el usuario con el ID más bajo.
    """
    db_engine = connection.vendor

    with schema_editor.connection.cursor() as cursor:
        if db_engine == 'postgresql':
            # 1. Eliminar social auth de usuarios duplicados
            cursor.execute("""
                DELETE FROM social_auth_usersocialauth
                WHERE user_id IN (
                    SELECT id FROM auth_user
                    WHERE email != ''
                      AND id NOT IN (
                          SELECT MIN(id) FROM auth_user
                          WHERE email != ''
                          GROUP BY email
                      )
                );
            """)
            # 2. Eliminar los usuarios duplicados
            cursor.execute("""
                DELETE FROM auth_user
                WHERE email != ''
                  AND id NOT IN (
                      SELECT MIN(id) FROM auth_user
                      WHERE email != ''
                      GROUP BY email
                  );
            """)
            # 3. Aplicar la constraint (idempotente)
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
                DELETE FROM auth_user
                WHERE email != ''
                  AND rowid NOT IN (
                      SELECT MIN(rowid) FROM auth_user
                      WHERE email != ''
                      GROUP BY email
                  );
            """)
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
    Limpia emails duplicados y aplica UNIQUE constraint sobre auth_user.email.
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
