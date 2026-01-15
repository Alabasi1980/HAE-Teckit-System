
import { IDataProvider } from '../../contracts';

// This is a placeholder. In the future, this will use axios/fetch to talk to your C# API.
export class HttpApiProvider implements IDataProvider {
  constructor() {
    console.log("HttpApiProvider initialized (Not yet implemented)");
  }
  
  get workItems(): any { throw new Error("Method not implemented."); }
  get projects(): any { throw new Error("Method not implemented."); }
  get users(): any { throw new Error("Method not implemented."); }
  get assets(): any { throw new Error("Method not implemented."); }
  get documents(): any { throw new Error("Method not implemented."); }
  get knowledge(): any { throw new Error("Method not implemented."); }
  get notifications(): any { throw new Error("Method not implemented."); }
  get fieldOps(): any { throw new Error("Method not implemented."); }
  get ai(): any { throw new Error("Method not implemented."); }
}
