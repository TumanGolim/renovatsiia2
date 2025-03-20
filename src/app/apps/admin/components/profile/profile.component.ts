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

interface ServiceCategory {
  category_id: number;
  category_name: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  subcategory_id: number;
  subcategory_name: string;
  description: string;
  price_from: number;
  price_to: number;
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
  categories: ServiceCategory[] = [];

  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);

  constructor() {}

  ngOnInit(): void {
    this.initForm();
    this.loadSavedData();
    this.loadServices();
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

  // Додаємо новий метод для завантаження сервісів
  private loadServices(): void {
    this.profileService.getServices().subscribe({
      next: (services: ServiceCategory[]) => {
        console.log('Завантажені сервіси:', services);
        this.categories = services;
      },
      error: (error) => {
        console.error('Помилка при завантаженні сервісів:', error);
      }
    });
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
  addSkill(category: ServiceCategory, subcategory: Subcategory): void {
    const exists = this.skillsArray.controls.some(
      (control) =>
        control.get('category_id')?.value === category.category_id &&
        control.get('subcategory_id')?.value === subcategory.subcategory_id
    );

    if (!exists) {
      const skillGroup = this.fb.group({
        category_id: [category.category_id, Validators.required],
        category_name: [category.category_name, Validators.required],
        subcategory_id: [subcategory.subcategory_id, Validators.required],
        subcategory_name: [subcategory.subcategory_name, Validators.required],
        price_from: [subcategory.price_from, [Validators.required, Validators.min(0)]],
        price_to: [subcategory.price_to, [Validators.required, Validators.min(0)]]
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
      avatar: this.selectedPhoto,
      location: 'Київ',
      available: true,
      rating: 0,
      service_categories: this.getUniqueCategories(formValue.skills),
      services: formValue.skills.map((skill: any) => ({
        subcategory_id: skill.subcategory_id,
        subcategory_name: skill.subcategory_name,
        price_from: skill.price_from,
        price_to: skill.price_to
      })),
      reviews: [],
      workPhotos: this.workPhotos.map((photo) => photo.src)
    };
  }
  
  // Допоміжний метод для унікальних категорій
  private getUniqueCategories(skills: any[]): any[] {
    const uniqueCategories = new Map();
    skills.forEach((skill) => {
      if (!uniqueCategories.has(skill.category_id)) {
        uniqueCategories.set(skill.category_id, {
          category_id: skill.category_id,
          category_name: skill.category_name
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
