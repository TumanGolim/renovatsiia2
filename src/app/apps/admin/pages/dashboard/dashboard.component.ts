import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';

interface WorkCategory {
  name: string;
  subtypes: string[];
}

interface WorkPhoto {
  id: number;
  src: string | ArrayBuffer;
  title?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  masterForm!: FormGroup;
  selectedPhoto: string | ArrayBuffer | null = null;

  // Нове поле для зберігання фотографій робіт
  workPhotos: WorkPhoto[] = [];
  nextPhotoId = 1;

  categories: WorkCategory[] = [
    {
      name: 'Стіни',
      subtypes: [
        'Фарбування',
        'Шпалери',
        'Штукатурка',
        'Плитка',
        'Декоративна обробка',
      ],
    },
    {
      name: 'Стелі',
      subtypes: ['Натяжні', 'Гіпсокартон', 'Фарбування', 'Підвісні'],
    },
    {
      name: 'Підлога',
      subtypes: ['Ламінат', 'Плитка', 'Паркет', 'Лінолеум', 'Стяжка'],
    },
    {
      name: 'Сантехніка',
      subtypes: [
        'Встановлення ванни',
        'Встановлення душової кабіни',
        'Монтаж труб',
        'Встановлення раковини',
        'Підключення пральної машини',
      ],
    },
    {
      name: 'Електрика',
      subtypes: [
        'Проводка',
        'Встановлення розеток',
        'Монтаж освітлення',
        'Електрощит',
      ],
    },
    {
      name: 'Двері та вікна',
      subtypes: [
        'Встановлення дверей',
        'Встановлення вікон',
        'Відкоси',
        'Підвіконня',
      ],
    },
    {
      name: 'Балкон та лоджія',
      subtypes: ['Засклення', 'Утеплення', 'Оздоблення'],
    },
    {
      name: 'Додаткові роботи',
      subtypes: ['Прибирання', 'Вивіз сміття', 'Демонтаж', "Дизайн інтер'єру"],
    },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.masterForm = this.fb.group({
      personalInfo: this.fb.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        phone: [
          '',
          [Validators.required, Validators.pattern(/^\+?[0-9]{10,12}$/)],
        ],
        experience: [0, [Validators.required, Validators.min(0)]],
        description: ['', [Validators.required, Validators.minLength(50)]], //можливо якщо це буде потрібнго зробити більше 50 символів то зміним це по потребі
      }),
      skills: this.fb.array([]),
    });
  }

  get skillsArray(): FormArray {
    return this.masterForm.get('skills') as FormArray;
  }

  addSkill(category: string, subtype: string): void {
    // Перевіряємо, чи є вже така навичка
    const exists = this.skillsArray.controls.some(
      (control) =>
        control.get('category')?.value === category &&
        control.get('subtype')?.value === subtype
    );

    if (!exists) {
      const skillGroup = this.fb.group({
        category: [category, Validators.required],
        subtype: [subtype, Validators.required],
        price: [0, [Validators.required, Validators.min(0)]],
      });

      this.skillsArray.push(skillGroup);
    }
  }

  removeSkill(index: number): void {
    this.skillsArray.removeAt(index);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        this.selectedPhoto = e.target?.result || null;
      };

      reader.readAsDataURL(file);
    }
  }

  // Нові методи для роботи з фотографіями робіт
  onWorkPhotoSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = (e) => {
          if (e.target?.result) {
            this.workPhotos.push({
              id: this.nextPhotoId++,
              src: e.target.result,
            });
          }
        };

        reader.readAsDataURL(file);
      }
    }
  }

  removeWorkPhoto(photoId: number): void {
    this.workPhotos = this.workPhotos.filter((photo) => photo.id !== photoId);
  }

  onSubmit(): void {
    if (this.masterForm.valid) {
      const formData = {
        ...this.masterForm.value,
        photo: this.selectedPhoto,
        workPhotos: this.workPhotos,
      };

      console.log('Дані профілю майстра:', formData);
      // Тут буде логіка відправки даних на сервер
      alert('Профіль успішно збережено!');
    } else {
      // Позначаємо всі поля як touched, щоб показати помилки валідації
      this.markFormGroupTouched(this.masterForm);
      alert("Будь ласка, заповніть усі обов'язкові поля коректно.");
    }
  }

  // Допоміжний метод для позначення всіх полів форми як touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }

  // Методи для роботи з вибором категорій
  selectedCategory: string | null = null;

  selectCategory(category: string): void {
    if (this.selectedCategory === category) {
      this.selectedCategory = null;
    } else {
      this.selectedCategory = category;
    }
  }
}
