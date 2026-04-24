const usuario=require('../models/Usuario');

const registrarUsuario=async (req,res)=>{
    try {
        const {Nombre, Correo, Contraseña, Documento}=req.body;
        const resultado=await usuario.crear({Nombre, Correo, Contraseña, Documento});
        const existe=await usuario.buscarPorUsuario(Documento);
        if(existe.length>0){
            return res.status(409).json({
                ok:false,
                message: 'El usuario ya existe'
            });
        }

        module.exports = { registrarUsuario }
        res.status(201).json({
            ok:true, 
            message: 'Usuario registrado exitosamente', 
            id: resultado.insertId
        }); 
    }
    catch (error) 
    {
        res.status(500).json({error: 'Error al registrar usuario'});
    }
};