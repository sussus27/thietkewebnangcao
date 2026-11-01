# Sử dụng kiến trúc microservice và ứng dụng phân tán.
- Chia thành music service, account service, upload service và streaming service.

- Music và account service xử lý metadata và thông tin account với các database riêng. Upload service và streaming service xử lý tác vụ liên quan đến object storage.
- Music và upload giao tiếp bất đồng bộ thông qua rabbitmq
