import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonInput,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonCheckbox,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService, Todo } from '../todo.service';

addIcons({ add });

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    IonInput,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonCheckbox,
  ],
})
export class HomePage implements OnInit {
  todos: Todo[] = [];
  editId: number | null = null;
  editTitle = '';

  constructor(
    private todoService: TodoService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadTodos();
  }

  async loadTodos() {
    this.todos = await this.todoService.getTodos();
  }

  async presentAddAlert() {
    const alert = await this.alertController.create({
      header: 'Nova tarefa',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Digite a tarefa',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Adicionar',
          handler: async (data) => {
            if (data.title && data.title.trim()) {
              await this.todoService.addTodo(data.title.trim());
              await this.loadTodos();
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async toggleDone(id: number, done: boolean) {
    await this.todoService.toggleDone(id, done);
    await this.loadTodos();
  }

  startEdit(todo: Todo) {
    this.editId = todo.id;
    this.editTitle = todo.title;
  }

  async saveEdit() {
    if (this.editId !== null && this.editTitle.trim()) {
      await this.todoService.editTodo(this.editId, this.editTitle.trim());
      this.editId = null;
      this.editTitle = '';
      await this.loadTodos();
    }
  }

  cancelEdit() {
    this.editId = null;
    this.editTitle = '';
  }

  async deleteTodo(id: number) {
    await this.todoService.deleteTodo(id);
    await this.loadTodos();
  }
}
