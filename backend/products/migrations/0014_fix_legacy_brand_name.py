from django.db import migrations, models


def fix_legacy_brand_name(apps, schema_editor):
    SiteSettings = apps.get_model("products", "SiteSettings")
    SiteSettings.objects.filter(brand_name="Affiliate Products Website").update(
        brand_name="Mr DSP Hub"
    )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0013_alter_sitesettings_email_from_address"),
    ]

    operations = [
        migrations.RunPython(fix_legacy_brand_name, noop_reverse),
        migrations.AlterField(
            model_name="sitesettings",
            name="brand_name",
            field=models.CharField(
                default="Mr DSP Hub",
                help_text="Brand/Company name displayed throughout the site",
                max_length=100,
            ),
        ),
    ]
