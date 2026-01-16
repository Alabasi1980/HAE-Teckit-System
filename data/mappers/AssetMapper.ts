
import { Asset, AssetStatus, AssetCategory } from '../../shared/types';

export interface AssetDTO {
  assetId: string;
  displayName: string;
  serialNumber: string;
  category: string;
  status: string;
  location: string;
  value: number;
  purchaseDate: string; // Fix: Added missing purchaseDate
  lastMaintenanceDate?: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
}

export class AssetMapper {
  static toDomain(dto: AssetDTO): Asset {
    return {
      id: dto.assetId,
      name: dto.displayName,
      serialNumber: dto.serialNumber,
      category: dto.category as AssetCategory,
      status: dto.status as AssetStatus,
      location: dto.location,
      value: dto.value,
      purchaseDate: dto.purchaseDate, // Fix: Added mapping for purchaseDate
      lastMaintenance: dto.lastMaintenanceDate,
      assignedToUserId: dto.assignedToUserId,
      assignedToUserName: dto.assignedToUserName
    };
  }

  static toDTO(domain: Partial<Asset>): Partial<AssetDTO> {
    return {
      assetId: domain.id,
      displayName: domain.name,
      serialNumber: domain.serialNumber,
      category: domain.category,
      status: domain.status,
      location: domain.location,
      value: domain.value,
      purchaseDate: domain.purchaseDate, // Fix: Added mapping for purchaseDate
      lastMaintenanceDate: domain.lastMaintenance,
      assignedToUserId: domain.assignedToUserId,
      assignedToUserName: domain.assignedToUserName
    };
  }
}
