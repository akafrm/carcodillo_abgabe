INSERT INTO "User" (id, name, email, password, role, phone, address, city, country, "birthDate", "driversLicenseNumber", "createdAt", "updatedAt") VALUES
('user-1', 'Admin-Fab', 'fab@admin.com', '$2b$10$I1UgTR4a9K8ty0rbALhHP.Cm6J.F42CpvoPReHD/tJz9WbM1qx2rK', 'ADMIN', '+49 123 456789', 'Broadway 1', 'Berlin', 'Germany', '1990-01-01', 'F34T434', NOW(), NOW()),
('user-2', 'Dom', 'dom@user.com', '$2b$10$3y3A6mpAJHagN7DjFqeESeyzQEskLWsJMvAatocsW3RO/9/.8CGra', 'MEMBER', '+49 987 654321', 'Wallstreet 2', 'Munich', 'Germany', '1995-05-05', 'F34T435', NOW(), NOW()),
('user-3', 'YB', 'yb@employee.com', '$2b$10$3C5lp63yIjB0nblRc91N4ulZlIM5uITmnYq9bRx79DjHTyEef4xUe', 'EMPLOYEE', '+49 555 123456', 'Tree 3', 'Hamburg', 'Germany', '1992-03-15', 'F34T436', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO "Location" (id, name, address, city, country, coordinates, "isActive", "createdAt", "updatedAt") VALUES
('loc-1', 'Berlin Central', 'Potsdamer Platz 1', 'Berlin', 'Germany', '52.5094,13.3759', true, NOW(), NOW()),
('loc-2', 'Munich Airport', 'Nordallee 25', 'Munich', 'Germany', '48.3538,11.7861', true, NOW(), NOW()),
('loc-3', 'Hamburg Central', 'Reeperbahn 7', 'Hamburg', 'Germany', '53.5511,9.9937', true, NOW(), NOW()),
('loc-4', 'Bremen Central Station', 'Am Brill 11', 'Bremen', 'Germany', '50.9429,6.9582', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Vehicle" (id, name, type, category, description, available, "imageUrl", "pricePerDay", location, features, "fuelType", transmission, seats, "createdAt", "updatedAt") VALUES
('vehicle-1', 'VW Golf', 'Compact', 'COMPACT', 'Citycruiser', true, '/vwgolf.jpeg', 35.00, 'Berlin Central', ARRAY['A/C', 'Radio', 'USB'], 'Gasoline', 'Manual', 5, NOW(), NOW()),
('vehicle-2', 'BMW X7', 'SUV', 'SUV', 'Large family SUV', true, '/x7.jpeg', 75.00, 'Munich Airport', ARRAY['A/C', 'Navigation', 'Automatik', 'Full Lether'], 'Gasoline', 'Automatic', 5, NOW(), NOW()),
('vehicle-3', 'Mercedes S-Class', 'Sedan', 'PREMIUM', 'Luxury-Modern-Limosine', true, '/sclass.jpeg', 95.00, 'Hamburg Central', ARRAY['A/C', 'Navigation', 'Full Lether', 'Seat Heating'], 'Gasoline', 'Automatic', 5, NOW(), NOW()),
('vehicle-4', 'BMW-M4', 'Sports Car', 'SPORTS', 'Sportscar', true, '/m4.jpeg', 150.00, 'Berlin Central', ARRAY['A/C', 'Radio', 'USB', 'Apple Carplay'], 'Gasoline', 'Automatic', 5, NOW(), NOW()),
('vehicle-5', 'Mercedes Sprinter', 'Van', 'VAN', 'Large van, ideal for trasportation', true, '/sprinter.jpeg', 65.00, 'Bremen Central Station', ARRAY['A/C', 'Radio'], 'Diesel', 'Manual', 3, NOW(), NOW()),
('vehicle-6', 'Audi A4', 'Sedan', 'STANDARD', 'Elegant-Middelclass-Limousine', true, '/a4.jpeg', 55.00, 'Berlin Central', ARRAY['A/C', 'Navigation', 'USB'], 'Gasoline', 'Automatic', 5, NOW(), NOW()),
('vehicle-7', 'Porsche 911', 'Sports Car', 'SPORTS', 'Sportscar', true, '/911.jpeg', 250.00, 'Munich Airport', ARRAY['A/C', 'Navigation', 'Full Lether', 'Sportpackage'], 'Gasoline', 'Automatic', 2, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Reservation" (id, "startDate", "endDate", "startTime", "endTime", "pickupLocation", "returnLocation", status, tariff, "totalPrice", "createdAt", "updatedAt", "userId", "vehicleId") VALUES
('res-1', '2025-07-20', '2025-07-25', '10:00', '18:00', 'Berlin Central', 'Berlin Central', 'CONFIRMED', 'BASIC', 175.00, NOW(), NOW(), 'user-2', 'vehicle-1'),
('res-2', '2025-07-28', '2025-08-02', '09:00', '17:00', 'Berlin Central', 'Berlin Central', 'PENDING', 'DISCOUNTED', 450.00, NOW(), NOW(), 'user-2', 'vehicle-6')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Payment" (id, amount, currency, "paymentMethod", "paymentStatus", "transactionId", "createdAt", "updatedAt", "userId", "reservationId") VALUES
('pay-123', 175.00, 'EUR', 'CREDIT_CARD', 'COMPLETED', 'TXN-123456789', NOW(), NOW(), 'user-2', 'res-1'),
('pay-456', 450.00, 'EUR', 'PAYPAL', 'PENDING', 'TXN-987654321', NOW(), NOW(), 'user-2', 'res-2')
ON CONFLICT (id) DO NOTHING;
