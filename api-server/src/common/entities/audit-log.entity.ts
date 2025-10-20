import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  SOFT_DELETE = 'SOFT_DELETE',
  RESTORE = 'RESTORE',
}

export enum AuditEntityType {
  USER = 'USER',
  PRODUCT = 'PRODUCT',
  ORDER = 'ORDER',
  ORDER_ITEM = 'ORDER_ITEM',
  AUTH = 'AUTH',
  SYSTEM = 'SYSTEM',
}

@Entity('audit_logs')
@Index(['entityType', 'entityId'])
@Index(['userId', 'createdAt'])
@Index(['action', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    enum: AuditAction,
    comment: '操作类型',
  })
  action: AuditAction;

  @Column({
    type: 'varchar',
    enum: AuditEntityType,
    comment: '实体类型',
  })
  entityType: AuditEntityType;

  @Column({
    nullable: true,
    comment: '实体ID',
  })
  entityId: number;

  @Column({
    nullable: true,
    comment: '操作用户ID',
  })
  userId: number;

  @Column({
    nullable: true,
    comment: '操作用户名',
  })
  userName: string;

  @Column({
    nullable: true,
    comment: '用户IP地址',
  })
  userIp: string;

  @Column({
    nullable: true,
    comment: '用户代理',
  })
  userAgent: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '操作详情',
  })
  description: string;

  @Column({
    type: 'json',
    nullable: true,
    comment: '变更前数据',
  })
  oldData: any;

  @Column({
    type: 'json',
    nullable: true,
    comment: '变更后数据',
  })
  newData: any;

  @Column({
    type: 'json',
    nullable: true,
    comment: '额外元数据',
  })
  metadata: any;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
