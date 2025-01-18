# Claude Assistant Chrome Extension

Una extensión de Chrome que permite recopilar información de páginas web y comunicarse con Claude 3.5 Sonnet para análisis y procesamiento de contenido.

## 🚀 Características

- Recopilación automática de contenido de páginas web visitadas
- Captura de texto seleccionado manualmente
- Integración con API de Claude 3.5 Sonnet
- Interfaz de usuario intuitiva con Tailwind CSS
- Almacenamiento seguro de API key
- Previsualización y edición de datos recopilados

## 🛠️ Tecnologías Utilizadas

- JavaScript (ES6+)
- Chrome Extensions API
- Tailwind CSS
- Anthropic Claude API

## 📦 Instalación

1. Clona este repositorio:
```bash
git clone [url-del-repositorio]
```

2. Abre Chrome y navega a `chrome://extensions/`

3. Activa el "Modo desarrollador"

4. Haz clic en "Cargar descomprimida" y selecciona el directorio del proyecto

## 🔧 Configuración

1. Obtén una API key de Anthropic
2. Abre la extensión y guarda tu API key en la configuración
3. ¡Listo para empezar!

## 💡 Uso

1. Haz clic en el icono de la extensión
2. Presiona "Start Collection" para comenzar a recopilar datos
3. Navega por las páginas web o selecciona texto
4. Presiona "Stop Collection" cuando termines
5. Revisa y edita los datos recopilados
6. Envía el contenido a Claude para análisis

## 📝 Tareas Pendientes

### Prioritarias
- [ ] Implementar manejo de errores más robusto en las llamadas a la API
- [ ] Añadir sistema de paginación para grandes cantidades de datos
- [ ] Implementar opciones de filtrado de contenido
- [ ] Añadir soporte para exportación de datos en diferentes formatos

### Mejoras Futuras
- [ ] Implementar sistema de templates para consultas frecuentes
- [ ] Añadir opciones de configuración avanzadas
- [ ] Crear sistema de etiquetado para contenido recopilado
- [ ] Implementar modo oscuro
- [ ] Añadir soporte para múltiples idiomas
- [ ] Optimizar el rendimiento en páginas con mucho contenido

### Bugs Conocidos
- [ ] El contador de caracteres no se actualiza en tiempo real
- [ ] Ocasionalmente se duplican entradas al cambiar rápidamente entre pestañas
- [ ] La interfaz se rompe con textos muy largos sin espacios

## 🔒 Seguridad

- Las API keys se almacenan de forma segura usando `chrome.storage.local`
- La extensión solo accede al contenido de las páginas cuando está activa
- Se implementan prácticas seguras de manejo de datos

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia
Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## 📬 Contacto

Tu Nombre - [@tu_twitter](https://twitter.com/edgaragp) - edgar@kntor.io

Link del proyecto: [https://github.com/edgargomero/extkntor](https://github.com/edgargomero/extkntor)
