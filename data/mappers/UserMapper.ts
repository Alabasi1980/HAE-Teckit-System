import { User } from '../../shared/types';

export interface UserDTO {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email?: string;
  phone?: string;
  department?: string;
  joinDate?: string;
}

export class UserMapper {
  static toDomain(dto: UserDTO): User {
    return {
      id: dto.id,
      name: dto.name,
      role: dto.role,
      avatar: dto.avatar,
      email: dto.email,
      phone: dto.phone,
      department: dto.department,
      joinDate: dto.joinDate
    };
  }

  static toDTO(domain: Partial<User>): Partial<UserDTO> {
    return {
      id: domain.id,
      name: domain.name,
      role: domain.role,
      avatar: domain.avatar,
      email: domain.email,
      phone: domain.phone,
      department: domain.department,
      joinDate: domain.joinDate
    };
  }
}
