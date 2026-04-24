CREATE DATABASE IF NOT EXISTS reservaya;
USE reservaya;

CREATE TABLE Usuario (
  idUsuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) NOT NULL,
  telefono BIGINT NOT NULL,
  contrasena VARCHAR(255),
  rol VARCHAR(255) NOT NULL
);

CREATE TABLE Mesa (
  idMesa INT AUTO_INCREMENT PRIMARY KEY,
  capacidad INT NOT NULL,
  estado TINYINT(1) NOT NULL
);

CREATE TABLE Reserva (
  idReserva INT AUTO_INCREMENT PRIMARY KEY,
  estado TINYINT(1) NOT NULL,
  fechaReservacion DATETIME NOT NULL,
  MesaidMesa INT NOT NULL,
  UsuarioidUsuario INT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  telefono BIGINT NOT NULL,
  correo VARCHAR(255) NOT NULL,
  numeroReserva VARCHAR(255) NOT NULL UNIQUE,
  observacion VARCHAR(255) NULL,
  CONSTRAINT FK_Reserva_Mesa FOREIGN KEY (MesaidMesa) REFERENCES Mesa(idMesa),
  CONSTRAINT FK_Reserva_Usuario FOREIGN KEY (UsuarioidUsuario) REFERENCES Usuario(idUsuario)
);