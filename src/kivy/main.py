import os
import json
from kivy.app import App
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.button import Button
from kivy.uix.textinput import TextInput
from kivy.uix.scrollview import ScrollView
from kivy.uix.gridlayout import GridLayout
from kivy.uix.popup import Popup
from kivy.clock import Clock
from kivy.properties import StringProperty, ListProperty
from plyer import filechooser
from dotenv import load_dotenv

# Import Rust AI Trainer module
try:
    import ai_trainer
    RUST_AVAILABLE = True
except ImportError:
    RUST_AVAILABLE = False
    print("Warning: Rust AI Trainer module not available. Using mock mode.")


class HomeScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        layout = BoxLayout(orientation='vertical', padding=10, spacing=10)

        title = Label(
            text='AI Training App',
            size_hint=(1, 0.2),
            font_size='24sp',
            bold=True
        )

        btn_new_training = Button(
            text='Start New Training',
            size_hint=(1, 0.15),
            background_color=(0.2, 0.6, 1, 1)
        )
        btn_new_training.bind(on_press=lambda x: self.manager.transition.direction = 'left' or setattr(self.manager, 'current', 'training'))

        btn_view_jobs = Button(
            text='View Training Jobs',
            size_hint=(1, 0.15),
            background_color=(0.2, 0.8, 0.4, 1)
        )
        btn_view_jobs.bind(on_press=lambda x: self.manager.transition.direction = 'left' or setattr(self.manager, 'current', 'jobs'))

        btn_test_model = Button(
            text='Test Model',
            size_hint=(1, 0.15),
            background_color=(0.9, 0.5, 0.2, 1)
        )
        btn_test_model.bind(on_press=lambda x: self.manager.transition.direction = 'left' or setattr(self.manager, 'current', 'test'))

        btn_settings = Button(
            text='Settings',
            size_hint=(1, 0.15),
            background_color=(0.5, 0.5, 0.5, 1)
        )
        btn_settings.bind(on_press=lambda x: self.manager.transition.direction = 'left' or setattr(self.manager, 'current', 'settings'))

        layout.add_widget(title)
        layout.add_widget(btn_new_training)
        layout.add_widget(btn_view_jobs)
        layout.add_widget(btn_test_model)
        layout.add_widget(btn_settings)

        self.add_widget(layout)


class TrainingScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.trainer = None
        self.selected_file = None

        layout = BoxLayout(orientation='vertical', padding=10, spacing=10)

        title = Label(
            text='Start New Training',
            size_hint=(1, 0.1),
            font_size='20sp',
            bold=True
        )

        # File selection
        file_layout = BoxLayout(size_hint=(1, 0.1), spacing=5)
        self.file_label = Label(text='No file selected', size_hint=(0.7, 1))
        btn_select = Button(text='Select Training Data', size_hint=(0.3, 1))
        btn_select.bind(on_press=self.select_file)
        file_layout.add_widget(self.file_label)
        file_layout.add_widget(btn_select)

        # Model selection
        model_layout = BoxLayout(size_hint=(1, 0.1), spacing=5)
        model_layout.add_widget(Label(text='Base Model:', size_hint=(0.3, 1)))
        self.model_input = TextInput(
            text='gpt-3.5-turbo',
            size_hint=(0.7, 1),
            multiline=False
        )
        model_layout.add_widget(self.model_input)

        # Hyperparameters
        epochs_layout = BoxLayout(size_hint=(1, 0.1), spacing=5)
        epochs_layout.add_widget(Label(text='Epochs:', size_hint=(0.3, 1)))
        self.epochs_input = TextInput(
            text='3',
            size_hint=(0.7, 1),
            multiline=False,
            input_filter='int'
        )
        epochs_layout.add_widget(self.epochs_input)

        batch_layout = BoxLayout(size_hint=(1, 0.1), spacing=5)
        batch_layout.add_widget(Label(text='Batch Size (optional):', size_hint=(0.3, 1)))
        self.batch_input = TextInput(
            text='',
            size_hint=(0.7, 1),
            multiline=False,
            input_filter='int'
        )
        batch_layout.add_widget(self.batch_input)

        lr_layout = BoxLayout(size_hint=(1, 0.1), spacing=5)
        lr_layout.add_widget(Label(text='Learning Rate (optional):', size_hint=(0.3, 1)))
        self.lr_input = TextInput(
            text='',
            size_hint=(0.7, 1),
            multiline=False,
            input_filter='float'
        )
        lr_layout.add_widget(self.lr_input)

        # Status
        self.status_label = Label(
            text='',
            size_hint=(1, 0.2),
            color=(1, 1, 0, 1)
        )

        # Buttons
        btn_layout = BoxLayout(size_hint=(1, 0.1), spacing=5)
        btn_start = Button(
            text='Start Training',
            background_color=(0.2, 0.8, 0.4, 1)
        )
        btn_start.bind(on_press=self.start_training)

        btn_back = Button(
            text='Back',
            background_color=(0.5, 0.5, 0.5, 1)
        )
        btn_back.bind(on_press=lambda x: setattr(self.manager, 'current', 'home'))

        btn_layout.add_widget(btn_start)
        btn_layout.add_widget(btn_back)

        layout.add_widget(title)
        layout.add_widget(file_layout)
        layout.add_widget(model_layout)
        layout.add_widget(epochs_layout)
        layout.add_widget(batch_layout)
        layout.add_widget(lr_layout)
        layout.add_widget(self.status_label)
        layout.add_widget(btn_layout)

        self.add_widget(layout)

    def select_file(self, instance):
        try:
            filechooser.open_file(on_selection=self.handle_file_selection)
        except:
            self.status_label.text = 'File chooser not available on this platform'

    def handle_file_selection(self, selection):
        if selection:
            self.selected_file = selection[0]
            self.file_label.text = os.path.basename(self.selected_file)
            self.status_label.text = f'Selected: {os.path.basename(self.selected_file)}'

    def start_training(self, instance):
        if not self.selected_file:
            self.status_label.text = 'Please select a training file first'
            return

        if not RUST_AVAILABLE:
            self.status_label.text = 'Error: AI Trainer module not available'
            return

        try:
            # Get API key from app
            api_key = App.get_running_app().api_key
            if not api_key:
                self.status_label.text = 'Error: API key not set. Please configure in Settings.'
                return

            # Initialize trainer
            if not self.trainer:
                self.trainer = ai_trainer.AITrainer(api_key)

            # Validate training data
            self.status_label.text = 'Validating training data...'
            is_valid = self.trainer.validate_training_data(self.selected_file)

            if not is_valid:
                self.status_label.text = 'Error: Invalid training data format'
                return

            # Get hyperparameters
            n_epochs = int(self.epochs_input.text) if self.epochs_input.text else 3
            batch_size = int(self.batch_input.text) if self.batch_input.text else None
            learning_rate = float(self.lr_input.text) if self.lr_input.text else None

            # Start training
            self.status_label.text = 'Starting training job...'
            result = self.trainer.start_training(
                self.selected_file,
                self.model_input.text,
                n_epochs,
                batch_size,
                learning_rate
            )

            job = json.loads(result)
            self.status_label.text = f'Training started! Job ID: {job["id"]}'

        except Exception as e:
            self.status_label.text = f'Error: {str(e)}'


class JobsScreen(Screen):
    jobs_data = ListProperty([])

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.trainer = None

        layout = BoxLayout(orientation='vertical', padding=10, spacing=10)

        title = Label(
            text='Training Jobs',
            size_hint=(1, 0.1),
            font_size='20sp',
            bold=True
        )

        # Jobs list
        self.scroll = ScrollView(size_hint=(1, 0.7))
        self.jobs_layout = GridLayout(
            cols=1,
            spacing=5,
            size_hint_y=None
        )
        self.jobs_layout.bind(minimum_height=self.jobs_layout.setter('height'))
        self.scroll.add_widget(self.jobs_layout)

        # Buttons
        btn_layout = BoxLayout(size_hint=(1, 0.1), spacing=5)
        btn_refresh = Button(
            text='Refresh',
            background_color=(0.2, 0.6, 1, 1)
        )
        btn_refresh.bind(on_press=self.refresh_jobs)

        btn_back = Button(
            text='Back',
            background_color=(0.5, 0.5, 0.5, 1)
        )
        btn_back.bind(on_press=lambda x: setattr(self.manager, 'current', 'home'))

        btn_layout.add_widget(btn_refresh)
        btn_layout.add_widget(btn_back)

        self.status_label = Label(
            text='',
            size_hint=(1, 0.1),
            color=(1, 1, 0, 1)
        )

        layout.add_widget(title)
        layout.add_widget(self.scroll)
        layout.add_widget(self.status_label)
        layout.add_widget(btn_layout)

        self.add_widget(layout)

    def on_enter(self):
        self.refresh_jobs(None)

    def refresh_jobs(self, instance):
        if not RUST_AVAILABLE:
            self.status_label.text = 'Error: AI Trainer module not available'
            return

        try:
            api_key = App.get_running_app().api_key
            if not api_key:
                self.status_label.text = 'Error: API key not set'
                return

            if not self.trainer:
                self.trainer = ai_trainer.AITrainer(api_key)

            self.status_label.text = 'Loading jobs...'
            result = self.trainer.list_jobs()
            jobs = json.loads(result)

            self.jobs_layout.clear_widgets()

            if not jobs:
                self.jobs_layout.add_widget(Label(
                    text='No training jobs found',
                    size_hint_y=None,
                    height=40
                ))
            else:
                for job in jobs:
                    job_widget = self.create_job_widget(job)
                    self.jobs_layout.add_widget(job_widget)

            self.status_label.text = f'Loaded {len(jobs)} jobs'

        except Exception as e:
            self.status_label.text = f'Error: {str(e)}'

    def create_job_widget(self, job):
        layout = BoxLayout(
            orientation='vertical',
            size_hint_y=None,
            height=100,
            padding=5
        )

        info = Label(
            text=f"Job ID: {job['id']}\nModel: {job['model']}\nStatus: {job['status']}",
            size_hint=(1, 0.7)
        )

        btn_layout = BoxLayout(size_hint=(1, 0.3), spacing=5)
        btn_status = Button(text='Check Status', size_hint=(0.5, 1))
        btn_status.bind(on_press=lambda x: self.check_status(job['id']))

        btn_cancel = Button(
            text='Cancel',
            size_hint=(0.5, 1),
            background_color=(1, 0.3, 0.3, 1)
        )
        btn_cancel.bind(on_press=lambda x: self.cancel_job(job['id']))

        btn_layout.add_widget(btn_status)
        btn_layout.add_widget(btn_cancel)

        layout.add_widget(info)
        layout.add_widget(btn_layout)

        return layout

    def check_status(self, job_id):
        try:
            result = self.trainer.get_job_status(job_id)
            job = json.loads(result)
            self.status_label.text = f"Job {job_id[:8]}... status: {job['status']}"
        except Exception as e:
            self.status_label.text = f'Error: {str(e)}'

    def cancel_job(self, job_id):
        try:
            result = self.trainer.cancel_job(job_id)
            job = json.loads(result)
            self.status_label.text = f"Job {job_id[:8]}... cancelled"
            self.refresh_jobs(None)
        except Exception as e:
            self.status_label.text = f'Error: {str(e)}'


class TestScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.trainer = None

        layout = BoxLayout(orientation='vertical', padding=10, spacing=10)

        title = Label(
            text='Test Model',
            size_hint=(1, 0.1),
            font_size='20sp',
            bold=True
        )

        # Model input
        model_layout = BoxLayout(size_hint=(1, 0.1), spacing=5)
        model_layout.add_widget(Label(text='Model ID:', size_hint=(0.3, 1)))
        self.model_input = TextInput(
            text='',
            size_hint=(0.7, 1),
            multiline=False,
            hint_text='Enter fine-tuned model ID'
        )
        model_layout.add_widget(self.model_input)

        # Prompt input
        prompt_label = Label(text='Prompt:', size_hint=(1, 0.05))
        self.prompt_input = TextInput(
            text='',
            size_hint=(1, 0.2),
            multiline=True,
            hint_text='Enter your test prompt here'
        )

        # Response display
        response_label = Label(text='Response:', size_hint=(1, 0.05))
        self.response_display = TextInput(
            text='',
            size_hint=(1, 0.3),
            multiline=True,
            readonly=True
        )

        # Buttons
        btn_layout = BoxLayout(size_hint=(1, 0.1), spacing=5)
        btn_test = Button(
            text='Test Model',
            background_color=(0.2, 0.8, 0.4, 1)
        )
        btn_test.bind(on_press=self.test_model)

        btn_back = Button(
            text='Back',
            background_color=(0.5, 0.5, 0.5, 1)
        )
        btn_back.bind(on_press=lambda x: setattr(self.manager, 'current', 'home'))

        btn_layout.add_widget(btn_test)
        btn_layout.add_widget(btn_back)

        self.status_label = Label(
            text='',
            size_hint=(1, 0.1),
            color=(1, 1, 0, 1)
        )

        layout.add_widget(title)
        layout.add_widget(model_layout)
        layout.add_widget(prompt_label)
        layout.add_widget(self.prompt_input)
        layout.add_widget(response_label)
        layout.add_widget(self.response_display)
        layout.add_widget(self.status_label)
        layout.add_widget(btn_layout)

        self.add_widget(layout)

    def test_model(self, instance):
        if not self.model_input.text:
            self.status_label.text = 'Please enter a model ID'
            return

        if not self.prompt_input.text:
            self.status_label.text = 'Please enter a prompt'
            return

        if not RUST_AVAILABLE:
            self.status_label.text = 'Error: AI Trainer module not available'
            return

        try:
            api_key = App.get_running_app().api_key
            if not api_key:
                self.status_label.text = 'Error: API key not set'
                return

            if not self.trainer:
                self.trainer = ai_trainer.AITrainer(api_key)

            self.status_label.text = 'Testing model...'
            response = self.trainer.test_model(
                self.model_input.text,
                self.prompt_input.text
            )

            self.response_display.text = response
            self.status_label.text = 'Test completed successfully'

        except Exception as e:
            self.status_label.text = f'Error: {str(e)}'
            self.response_display.text = ''


class SettingsScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        layout = BoxLayout(orientation='vertical', padding=10, spacing=10)

        title = Label(
            text='Settings',
            size_hint=(1, 0.1),
            font_size='20sp',
            bold=True
        )

        # API Key
        api_layout = BoxLayout(size_hint=(1, 0.1), spacing=5)
        api_layout.add_widget(Label(text='OpenAI API Key:', size_hint=(0.3, 1)))
        self.api_input = TextInput(
            text='',
            size_hint=(0.7, 1),
            multiline=False,
            password=True
        )
        api_layout.add_widget(self.api_input)

        self.status_label = Label(
            text='',
            size_hint=(1, 0.5),
            color=(1, 1, 0, 1)
        )

        # Buttons
        btn_layout = BoxLayout(size_hint=(1, 0.1), spacing=5)
        btn_save = Button(
            text='Save',
            background_color=(0.2, 0.8, 0.4, 1)
        )
        btn_save.bind(on_press=self.save_settings)

        btn_back = Button(
            text='Back',
            background_color=(0.5, 0.5, 0.5, 1)
        )
        btn_back.bind(on_press=lambda x: setattr(self.manager, 'current', 'home'))

        btn_layout.add_widget(btn_save)
        btn_layout.add_widget(btn_back)

        layout.add_widget(title)
        layout.add_widget(api_layout)
        layout.add_widget(self.status_label)
        layout.add_widget(btn_layout)

        self.add_widget(layout)

    def on_enter(self):
        self.api_input.text = App.get_running_app().api_key or ''

    def save_settings(self, instance):
        App.get_running_app().api_key = self.api_input.text
        self.status_label.text = 'Settings saved successfully!'
        Clock.schedule_once(lambda dt: setattr(self.status_label, 'text', ''), 2)


class AITrainingApp(App):
    api_key = StringProperty('')

    def build(self):
        # Load environment variables
        load_dotenv()
        self.api_key = os.getenv('OPENAI_API_KEY', '')

        # Create screen manager
        sm = ScreenManager()
        sm.add_widget(HomeScreen(name='home'))
        sm.add_widget(TrainingScreen(name='training'))
        sm.add_widget(JobsScreen(name='jobs'))
        sm.add_widget(TestScreen(name='test'))
        sm.add_widget(SettingsScreen(name='settings'))

        return sm


if __name__ == '__main__':
    AITrainingApp().run()
