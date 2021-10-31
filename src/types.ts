export type coordinates = {
  latitude: number;
  longitude: number;
}

export interface getChatsQuery {
  arguments : {
    name : string;
    location: coordinates;
  }
}

export interface getNearChatsQuery {
  arguments : {
    location: coordinates;
  }
}

export interface createChatQuery {
  arguments : {
    name : string;
    location: coordinates;
  }
}

export interface IChat {
  name: string;
  location: {
    type: string;
    coordinates: number[]
  }
  id: string;
}
