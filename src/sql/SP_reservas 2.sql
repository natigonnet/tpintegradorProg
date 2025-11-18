-- SP_reservas.sql
-- Contenido original con delimitadores adaptado para ejecución desde Node.js (se removieron las líneas DELIMITER y se reemplazaron los separadores especiales por ';')

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_reserva`(
    IN p_fecha_reserva DATE,
    IN p_salon_id INT,
    IN p_usuario_id INT,
    IN p_turno_id INT,
    IN p_foto_cumpleaniero VARCHAR(255),
    IN p_tematica VARCHAR(255),
    IN p_servicios JSON
)
BEGIN
    DECLARE v_importe_salon DECIMAL(10,2);
    DECLARE v_total_servicios DECIMAL(10,2) DEFAULT 0;
    DECLARE v_importe_total DECIMAL(10,2);
    DECLARE v_nueva_reserva_id INT;
    DECLARE v_servicio_id INT;
    DECLARE v_importe_servicio DECIMAL(10,2);
    DECLARE i INT DEFAULT 0;
    DECLARE v_count INT;
    
    -- 1. Obtener el importe del salón desde la tabla salones
    SELECT importe INTO v_importe_salon 
    FROM salones 
    WHERE salon_id = p_salon_id;
    
    -- Si no encuentra, usar 0
    IF v_importe_salon IS NULL THEN
        SET v_importe_salon = 0;
    END IF;
    
    
    IF p_servicios IS NOT NULL AND p_servicios != 'null' THEN
        SET v_count = JSON_LENGTH(p_servicios);
        
        WHILE i < v_count DO
            -- Extraer servicio_id e importe del JSON
            SET v_servicio_id = CAST(JSON_UNQUOTE(JSON_EXTRACT(p_servicios, CONCAT('$[', i, '].servicio_id'))) AS UNSIGNED);
            SET v_importe_servicio = CAST(JSON_UNQUOTE(JSON_EXTRACT(p_servicios, CONCAT('$[', i, '].importe'))) AS DECIMAL(10,2));
            
           
            SET v_total_servicios = v_total_servicios + v_importe_servicio;
            SET i = i + 1;
        END WHILE;
    END IF;
    
    SET v_importe_total = v_importe_salon + v_total_servicios;
    

    INSERT INTO reservas (
        fecha_reserva, salon_id, usuario_id, turno_id, 
        foto_cumpleaniero, tematica, importe_salon, importe_total
    ) VALUES (
        p_fecha_reserva, p_salon_id, p_usuario_id, p_turno_id,
        p_foto_cumpleaniero, p_tematica, v_importe_salon, v_importe_total
    );
    
    SET v_nueva_reserva_id = LAST_INSERT_ID();
    
    -- 5. Devolver el ID de la nueva reserva
    SELECT v_nueva_reserva_id AS nueva_reserva_id;
END;


CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_reporte_reservas`(
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE,
    IN p_salon_id INT,
    IN p_usuario_id INT
)
BEGIN
    SELECT 
        r.reserva_id,
        r.fecha_reserva,
        r.tematica,
        r.importe_salon,
        r.importe_total,
        r.creado,
        
        -- Datos del salón
        s.titulo AS salon_titulo,
        s.direccion AS salon_direccion,
        s.capacidad AS salon_capacidad,
        
        -- Datos del turno
        t.hora_desde,
        t.hora_hasta,
        
        -- Datos del usuario
        u.usuario_id,
        CONCAT(u.nombre, ' ', u.apellido) AS usuario_nombre_completo,
        u.nombre_usuario,
        u.celular,
        
        -- Servicios contratados (como texto)
        (SELECT GROUP_CONCAT(
            CONCAT(serv.descripcion, ' ($', FORMAT(rs.importe, 2), ')') 
            SEPARATOR '; '
         ) FROM reservas_servicios rs
         INNER JOIN servicios serv ON rs.servicio_id = serv.servicio_id
         WHERE rs.reserva_id = r.reserva_id) AS servicios_contratados,
         
        -- Total servicios
        COALESCE(
            (SELECT SUM(importe) FROM reservas_servicios WHERE reserva_id = r.reserva_id), 
            0
        ) AS total_servicios,
        
        -- Cantidad de servicios
        (SELECT COUNT(*) FROM reservas_servicios WHERE reserva_id = r.reserva_id) AS cantidad_servicios
        
    FROM reservas r
    INNER JOIN salones s ON r.salon_id = s.salon_id
    INNER JOIN turnos t ON r.turno_id = t.turno_id  
    INNER JOIN usuarios u ON r.usuario_id = u.usuario_id
    WHERE r.activo = 1
    AND (p_fecha_inicio IS NULL OR r.fecha_reserva >= p_fecha_inicio)
    AND (p_fecha_fin IS NULL OR r.fecha_reserva <= p_fecha_fin)
    AND (p_salon_id IS NULL OR r.salon_id = p_salon_id)
    AND (p_usuario_id IS NULL OR r.usuario_id = p_usuario_id)
    ORDER BY r.fecha_reserva DESC, r.creado DESC;
END;


CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_reserva_completa`(IN p_reserva_id INT)
BEGIN
    SELECT 
        r.reserva_id,
        r.fecha_reserva,
        r.foto_cumpleaniero,
        r.tematica,
        r.importe_salon,
        r.importe_total,
        r.activo,
        r.creado,
        r.modificado,
        
        -- Datos del salón
        s.salon_id,
        s.titulo AS salon_titulo,
        s.direccion AS salon_direccion,
        s.capacidad AS salon_capacidad,
        
        -- Datos del turno
        t.turno_id,
        t.orden AS turno_orden,
        t.hora_desde,
        t.hora_hasta,
        
        -- Datos del usuario
        u.usuario_id,
        u.nombre,
        u.apellido,
        CONCAT(u.nombre, ' ', u.apellido) AS usuario_nombre_completo,
        u.nombre_usuario,
        u.celular,
        u.tipo_usuario,
        
        -- Servicios contratados
        (SELECT GROUP_CONCAT(
            CONCAT(serv.descripcion, ' ($', FORMAT(rs.importe, 2), ')') 
            SEPARATOR '; '
         ) FROM reservas_servicios rs
         INNER JOIN servicios serv ON rs.servicio_id = serv.servicio_id
         WHERE rs.reserva_id = r.reserva_id) AS servicios_contratados,
         
        -- Total servicios
        COALESCE(
            (SELECT SUM(importe) FROM reservas_servicios WHERE reserva_id = r.reserva_id), 
            0
        ) AS total_servicios
        
    FROM reservas r
    INNER JOIN salones s ON r.salon_id = s.salon_id
    INNER JOIN turnos t ON r.turno_id = t.turno_id  
    INNER JOIN usuarios u ON r.usuario_id = u.usuario_id
    WHERE r.reserva_id = p_reserva_id AND r.activo = 1;
END;
