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
  category_id: number;
  category_name: string;
  subcategories: {
    subcategory_id: number;
    subcategory_name: string;
  }[];
}

interface WorkPhoto {
  id: number;
  src: string | ArrayBuffer;
  title?: string;
}

interface ServiceCategory {
  category_id: number;
  category_name: string;
}

interface Service {
  subcategory_id: number;
  subcategory_name: string;
  price_from: number;
  price_to: number;
}

interface ProfileData {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  experience: number;
  rating?: number;
  description: string;
  service_categories: ServiceCategory[];
  services: Service[];
  avatar?: string;
  location?: string;
  available: boolean;
  reviews: any[];
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  public profileForm!: FormGroup;
  public selectedPhoto: string | ArrayBuffer | null = null;
  public workPhotos: WorkPhoto[] = [];
  public nextPhotoId = 1;
  public selectedCategory: string | null = null;
  public categories: WorkCategory[] = [];

  constructor(private fb: FormBuilder) {}

  public ngOnInit(): void {
    this.initForm();
    this.loadSavedData();
    this.loadCategories();
  }

  public initForm(): void {
    this.profileForm = this.fb.group({
      personalInfo: this.fb.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        phone: [
          '',
          [Validators.required, Validators.pattern(/^\+?[0-9]{10,12}$/)],
        ],
        email: ['', [Validators.required, Validators.email]],
        experience: [0, [Validators.required, Validators.min(0)]],
        description: ['', [Validators.required, Validators.minLength(50)]],
        location: [''],
        available: [true],
      }),
      skills: this.fb.array([]),
    });
  }

  public loadSavedData(): void {
    // Тут буде код для завантаження даних профілю з сервера
    // Наразі залишаємо пустим або можна додати тестові дані
  }

  public get skillsArray(): FormArray {
    return this.profileForm.get('skills') as FormArray;
  }

  public selectCategory(category: string): void {
    this.selectedCategory =
      this.selectedCategory === category ? null : category;
  }

  public addSkill(category: any, subtype: any): void {
    const exists = this.skillsArray.controls.some(
      (control) =>
        control.get('subcategory_id')?.value === subtype.subcategory_id
    );

    if (!exists) {
      const skillGroup = this.fb.group({
        category_id: [category.category_id],
        category_name: [category.category_name],
        subcategory_id: [subtype.subcategory_id],
        subcategory_name: [subtype.subcategory_name],
        price_from: [0, [Validators.required, Validators.min(0)]],
        price_to: [0, [Validators.required, Validators.min(0)]],
      });

      this.skillsArray.push(skillGroup);
    }
  }

  public removeSkill(index: number): void {
    this.skillsArray.removeAt(index);
  }

  public onProfilePhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedPhoto = e.target?.result || null;
      };
      reader.readAsDataURL(file);
    }
  }

  public onWorkPhotoSelected(event: Event): void {
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

  public removeWorkPhoto(photoId: number): void {
    this.workPhotos = this.workPhotos.filter((photo) => photo.id !== photoId);
  }

  public onSubmit(): void {
    if (this.profileForm.valid) {
      const formValue = this.profileForm.value;
      const skills = this.skillsArray.value;

      const profileData: ProfileData = {
        firstName: formValue.personalInfo.firstName,
        lastName: formValue.personalInfo.lastName,
        phone: formValue.personalInfo.phone,
        email: formValue.personalInfo.email,
        experience: formValue.personalInfo.experience,
        description: formValue.personalInfo.description,
        location: formValue.personalInfo.location || '',
        available: formValue.personalInfo.available,
        // Группируем категории услуг
        service_categories: this.getUniqueCategories(skills),
        // Преобразуем навыки в услуги
        services: skills.map((skill: any) => ({
          subcategory_id: skill.subcategory_id,
          subcategory_name: skill.subcategory_name,
          price_from: skill.price_from,
          price_to: skill.price_to,
        })),
        avatar: (this.selectedPhoto as string) || '',
        reviews: [],
      };

      console.log('Профіль майстра:', profileData);
      this.saveProfile(profileData);
    } else {
      this.markFormGroupTouched(this.profileForm);
      alert("Будь ласка, заповніть усі обов'язкові поля коректно.");
    }
  }

  public getUniqueCategories(skills: any[]): ServiceCategory[] {
    const uniqueCategories = new Map<number, ServiceCategory>();

    skills.forEach((skill) => {
      if (!uniqueCategories.has(skill.category_id)) {
        uniqueCategories.set(skill.category_id, {
          category_id: skill.category_id,
          category_name: skill.category_name,
        });
      }
    });

    return Array.from(uniqueCategories.values());
  }

  public saveProfile(profileData: ProfileData): void {
    // Здесь будет отправка данных на сервер
    fetch('http://localhost:3000/masters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
        alert('Профіль успішно збережено!');
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Помилка при збереженні профілю');
      });
  }

  public markFormGroupTouched(formGroup: FormGroup): void {
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

  private loadCategories(): void {
    fetch('http://localhost:3000/serviceCategories')
      .then((response) => response.json())
      .then((data) => {
        this.categories = data.map((category: any) => ({
          category_id: category.category_id,
          category_name: category.category_name,
          subcategories: category.subcategories.map((sub: any) => ({
            subcategory_id: sub.subcategory_id,
            subcategory_name: sub.subcategory_name,
          })),
        }));
      })
      .catch((error) => {
        console.error('Помилка при завантаженні категорій:', error);
        alert('Помилка при завантаженні категорій');
      });
  }
}
