
import { AppArticle } from '../../shared/types'; // Updated: Use AppArticle

export interface ArticleDTO {
  articleId: string;
  title: string;
  category: string;
  authorName: string;
  lastUpdated: string;
  tags: string[];
  content: string;
}

export class ArticleMapper {
  static toDomain(dto: ArticleDTO): AppArticle { // Updated: Use AppArticle
    return {
      id: dto.articleId,
      title: dto.title,
      category: dto.category,
      authorName: dto.authorName,
      lastUpdated: dto.lastUpdated,
      tags: dto.tags || [],
      content: dto.content
    };
  }

  static toDTO(domain: Partial<AppArticle>): Partial<ArticleDTO> { // Updated: Use AppArticle
    return {
      articleId: domain.id,
      title: domain.title,
      category: domain.category,
      authorName: domain.authorName,
      lastUpdated: domain.lastUpdated,
      tags: domain.tags,
      content: domain.content
    };
  }
}
