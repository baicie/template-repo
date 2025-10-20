import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ comment: '删除时间', nullable: true })
  deletedAt?: Date;

  @Column({ comment: '创建者ID', nullable: true })
  createdBy?: number;

  @Column({ comment: '更新者ID', nullable: true })
  updatedBy?: number;

  @Column({ comment: '删除者ID', nullable: true })
  deletedBy?: number;

  @Column({ comment: '是否已删除', default: false })
  isDeleted: boolean = false;

  /**
   * 软删除
   */
  softDelete(userId?: number): void {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = userId;
  }

  /**
   * 恢复软删除
   */
  restore(userId?: number): void {
    this.isDeleted = false;
    this.deletedAt = undefined;
    this.deletedBy = undefined;
    this.updatedBy = userId;
  }

  /**
   * 检查是否已删除
   */
  isDeletedEntity(): boolean {
    return this.isDeleted || !!this.deletedAt;
  }
}
