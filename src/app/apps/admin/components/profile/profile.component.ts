import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';

import { ProfileService } from '../../../../core/services/profile.service';


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
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  selectedPhoto: string | ArrayBuffer | null = null;
  workPhotos: WorkPhoto[] = [];
  nextPhotoId = 1;
  selectedCategory: string | null = null;

  // Перелік категорій робіт
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

  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);

  constructor() {}

  ngOnInit(): void {
    this.initForm();
    this.loadSavedData();
  }

  // Ініціалізація форми
  private initForm(): void {
    this.profileForm = this.fb.group({
      personalInfo: this.fb.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        phone: [
          '',
          [Validators.required, Validators.pattern(/^\+?[0-9]{10,12}$/)],
        ],
        experience: [0, [Validators.required, Validators.min(0)]],
        description: ['', [Validators.required, Validators.minLength(50)]],
      }),
      skills: this.fb.array([]),
    });
  }

  // Завантаження збережених даних (в майбутньому з API)
  private loadSavedData(): void {
    // Тут буде код для завантаження даних профілю з сервера
    // Наразі залишаємо пустим або можна додати тестові дані
  }

  // Геттер для доступу до масиву навичок
  get skillsArray(): FormArray {
    return this.profileForm.get('skills') as FormArray;
  }

  // Метод для вибору категорії
  selectCategory(category: string): void {
    this.selectedCategory =
      this.selectedCategory === category ? null : category;
  }

  // Додавання навички
  addSkill(category: string, subtype: string): void {
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

  // Видалення навички
  removeSkill(index: number): void {
    this.skillsArray.removeAt(index);
  }

  // Обробка вибору фотографії профілю
  onProfilePhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedPhoto = e.target?.result || null;
      };
      reader.readAsDataURL(file);
    }
  }

  // Обробка вибору фотографій робіт
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

  // Видалення фотографії роботи
  removeWorkPhoto(photoId: number): void {
    this.workPhotos = this.workPhotos.filter((photo) => photo.id !== photoId);
  }

  // Відправка форми
  onSubmit(): void {
  if (this.profileForm.valid) {
    const profileData = this.prepareProfileData();

    this.profileService.createMasterProfile(profileData).subscribe({
      next: (response) => {
        alert('Профіль успішно збережено!');
        console.log('Відповідь сервера:', response);
      },
      error: (error) => {
        alert('Сталася помилка, спробуйте ще раз.');
        console.error('Помилка:', error);
      },
    });
  } else {
    this.markFormGroupTouched(this.profileForm);
    alert("Будь ласка, заповніть усі обов'язкові поля коректно.");
  }
  }
  
  private prepareProfileData(): any {
    const formValue = this.profileForm.value;
  
    return {
      firstName: formValue.personalInfo.firstName,
      lastName: formValue.personalInfo.lastName,
      phone: formValue.personalInfo.phone,
      experience: formValue.personalInfo.experience,
      description: formValue.personalInfo.description,
      avatar: this.selectedPhoto, // тут URL зберігаємо після завантаження файлу
      location: 'Київ', // можна зробити поле в формі
      available: true,
      rating: 0,
      service_categories: this.getUniqueCategories(formValue.skills),
      services: formValue.skills.map((skill: any) => ({
        subcategory_name: skill.subtype,
        price_from: skill.price,
        price_to: skill.price, // можна розширити, додавши поле для price_to
      })),
      reviews: [],
      workPhotos: this.workPhotos.map((photo) => photo.src), // URL після завантаження
    };
  }
  
  // Допоміжний метод для унікальних категорій
  private getUniqueCategories(skills: any[]): any[] {
    const uniqueCategories = new Map();
    skills.forEach((skill) => {
      if (!uniqueCategories.has(skill.category)) {
        uniqueCategories.set(skill.category, {
          category_name: skill.category,
          category_id: this.categories.find((c) => c.name === skill.category)?.name,
        });
      }
    });
    return Array.from(uniqueCategories.values());
  }

  // Допоміжний метод для позначення полів як "торкнуті"
  private markFormGroupTouched(formGroup: FormGroup): void {
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
}
