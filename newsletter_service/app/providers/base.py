from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any

class BaseEmailProvider(ABC):
    @abstractmethod
    def send_one(self, to_email: str, subject: str, html_content: str, text_content: str, 
                 metadata: Optional[Dict[str, Any]] = None) -> str:
        """Envia um único email e retorna o provider_message_id"""
        pass

    @abstractmethod
    def verify_webhook(self, payload: Any, headers: Dict[str, str]) -> bool:
        """Verifica a assinatura do webhook do provider"""
        pass

    @abstractmethod
    def parse_events(self, payload: Any) -> List[Dict[str, Any]]:
        """Mapeia eventos do provider para o formato interno {email, event_type, timestamp, etc}"""
        pass
