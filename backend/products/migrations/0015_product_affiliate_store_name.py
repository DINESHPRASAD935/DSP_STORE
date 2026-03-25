from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0014_fix_legacy_brand_name"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="affiliate_store_name",
            field=models.CharField(
                blank=True,
                default="",
                help_text="Partner store name shown on the product page (e.g. Amazon, Flipkart, Meesho).",
                max_length=80,
            ),
        ),
    ]
