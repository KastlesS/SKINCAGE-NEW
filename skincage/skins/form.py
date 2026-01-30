from django import forms
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Row, Column, Fieldset, Submit
from .models import Skin

class SkinForm(forms.ModelForm):
    class Meta:
        model = Skin
        fields = '__all__'

    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'post'
        self.helper.form_enctype = 'multipart/form-data'

        self.helper.layout = Layout(
            Fieldset(
                'Datos Skin',
                Row(
                    Column('id_skin', css_class='col-md-6'),
                    Column('nombre', css_class='col-md-6'),
                ),
                Row(
                    Column('desgaste', css_class='col-md-4'),
                    Column('stattrack', css_class='col-md-4'),
                    Column('precio', css_class='col-md-4'),
                ),
                Row(
                    Column('stock', css_class='col-md-6'),
                )
            ),
            Submit('submit', 'Guardar Skin', css_class='btn btn-primary')
        )