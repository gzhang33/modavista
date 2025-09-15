<?php
// api/error_messages.php
// 多语言错误信息管理系统

/**
 * 获取多语言错误信息
 * @param string $code 错误代码
 * @param string $lang 语言代码 (如: en, fr, de, es, it)
 * @param array $params 参数替换数组
 * @return string 翻译后的错误信息
 */
function get_error_message($code, $lang = 'en', $params = []) {
    $messages = get_error_messages();
    
    // 获取指定语言的错误信息
    $lang_messages = $messages[$lang] ?? $messages['en'];
    $message = $lang_messages[$code] ?? $messages['en'][$code] ?? "Unknown error: $code";
    
    // 替换参数
    if (!empty($params)) {
        foreach ($params as $key => $value) {
            $message = str_replace("{{$key}}", $value, $message);
        }
    }
    
    return $message;
}

/**
 * 获取所有语言的错误信息
 * @return array 错误信息数组
 */
function get_error_messages() {
    return [
        'en' => [
            // 通用错误
            'METHOD_NOT_ALLOWED' => 'Only POST method is supported',
            'INVALID_JSON' => 'Invalid JSON data format',
            'RATE_LIMITED' => 'Too many requests. Please try again later',
            'REQUIRED_FIELD' => 'Required field is missing: {field}',
            'INVALID_EMAIL' => 'Please provide a valid email address',
            'INVALID_LENGTH' => 'Length should be between {min} and {max} characters',
            'DATABASE_CONNECTION_FAILED' => 'Database connection failed',
            'UNAUTHORIZED_ACCESS' => 'Unauthorized access. Please login first',
            'UNSUPPORTED_METHOD' => 'Unsupported method',
            'PRODUCT_NOT_FOUND' => 'Product not found',
            'TRANSLATION_FAILED' => 'Translation failed',
            'SAVE_FAILED' => 'Save operation failed',
            
            // 联系表单错误
            'CONTACT_SENT_SUCCESS' => 'Message sent successfully! We will contact you soon',
            'CONTACT_RATE_LIMITED' => 'Please wait before sending another message',
            'CONTACT_INVALID_DATA' => 'Please check your information and try again',
            
            // 产品相关错误
            'PRODUCTS_LOAD_FAILED' => 'Failed to load products',
            'PRODUCT_DETAILS_LOAD_FAILED' => 'Failed to load product details',
            
            // 翻译相关错误
            'API_KEY_NOT_CONFIGURED' => 'OpenAI API key not configured, please check .htaccess file',
            'INVALID_ACTION' => 'Unsupported operation type',
            'EMPTY_CONTENT' => 'Product name and description cannot be empty at the same time',
            'INVALID_TARGET_LANGUAGES' => 'Target language list cannot be empty',
            'UNSUPPORTED_SOURCE_LANGUAGE' => 'Unsupported source language',
            'UNSUPPORTED_TARGET_LANGUAGE' => 'Unsupported target language: {lang}',
            'MISSING_PRODUCT_ID' => 'Product ID cannot be empty',
            'EMPTY_TRANSLATIONS' => 'Translation content cannot be empty',
            'DB_PREPARE_FAILED' => 'Database prepare failed: {error}',
            'DB_EXECUTE_FAILED' => 'Database execute failed: {error}',
            'TX_FAILED' => 'Save translation failed: {error}',
        ],
        
        'fr' => [
            // 通用错误
            'METHOD_NOT_ALLOWED' => 'Seule la méthode POST est supportée',
            'INVALID_JSON' => 'Format de données JSON invalide',
            'RATE_LIMITED' => 'Trop de requêtes. Veuillez réessayer plus tard',
            'REQUIRED_FIELD' => 'Champ obligatoire manquant: {field}',
            'INVALID_EMAIL' => 'Veuillez fournir une adresse e-mail valide',
            'INVALID_LENGTH' => 'La longueur doit être entre {min} et {max} caractères',
            'DATABASE_CONNECTION_FAILED' => 'Échec de la connexion à la base de données',
            'UNAUTHORIZED_ACCESS' => 'Accès non autorisé. Veuillez vous connecter d\'abord',
            'UNSUPPORTED_METHOD' => 'Méthode non supportée',
            'PRODUCT_NOT_FOUND' => 'Produit non trouvé',
            'TRANSLATION_FAILED' => 'Traduction échouée',
            'SAVE_FAILED' => 'Échec de l\'opération de sauvegarde',
            
            // 联系表单错误
            'CONTACT_SENT_SUCCESS' => 'Message envoyé avec succès! Nous vous contacterons bientôt',
            'CONTACT_RATE_LIMITED' => 'Veuillez attendre avant d\'envoyer un autre message',
            'CONTACT_INVALID_DATA' => 'Veuillez vérifier vos informations et réessayer',
            
            // 产品相关错误
            'PRODUCTS_LOAD_FAILED' => 'Échec du chargement des produits',
            'PRODUCT_DETAILS_LOAD_FAILED' => 'Échec du chargement des détails du produit',
            
            // 翻译相关错误
            'API_KEY_NOT_CONFIGURED' => 'Clé API OpenAI non configurée, veuillez vérifier le fichier .htaccess',
            'INVALID_ACTION' => 'Type d\'opération non supporté',
            'EMPTY_CONTENT' => 'Le nom et la description du produit ne peuvent pas être vides en même temps',
            'INVALID_TARGET_LANGUAGES' => 'La liste des langues cibles ne peut pas être vide',
            'UNSUPPORTED_SOURCE_LANGUAGE' => 'Langue source non supportée',
            'UNSUPPORTED_TARGET_LANGUAGE' => 'Langue cible non supportée: {lang}',
            'MISSING_PRODUCT_ID' => 'L\'ID du produit ne peut pas être vide',
            'EMPTY_TRANSLATIONS' => 'Le contenu de la traduction ne peut pas être vide',
            'DB_PREPARE_FAILED' => 'Préparation de la base de données échouée: {error}',
            'DB_EXECUTE_FAILED' => 'Exécution de la base de données échouée: {error}',
            'TX_FAILED' => 'Sauvegarde de la traduction échouée: {error}',
        ],
        
        'de' => [
            // 通用错误
            'METHOD_NOT_ALLOWED' => 'Nur POST-Methode wird unterstützt',
            'INVALID_JSON' => 'Ungültiges JSON-Datenformat',
            'RATE_LIMITED' => 'Zu viele Anfragen. Bitte versuchen Sie es später erneut',
            'REQUIRED_FIELD' => 'Erforderliches Feld fehlt: {field}',
            'INVALID_EMAIL' => 'Bitte geben Sie eine gültige E-Mail-Adresse an',
            'INVALID_LENGTH' => 'Länge sollte zwischen {min} und {max} Zeichen liegen',
            'DATABASE_CONNECTION_FAILED' => 'Datenbankverbindung fehlgeschlagen',
            'UNAUTHORIZED_ACCESS' => 'Unbefugter Zugriff. Bitte melden Sie sich zuerst an',
            'UNSUPPORTED_METHOD' => 'Nicht unterstützte Methode',
            'PRODUCT_NOT_FOUND' => 'Produkt nicht gefunden',
            'TRANSLATION_FAILED' => 'Übersetzung fehlgeschlagen',
            'SAVE_FAILED' => 'Speicheroperation fehlgeschlagen',
            
            // 联系表单错误
            'CONTACT_SENT_SUCCESS' => 'Nachricht erfolgreich gesendet! Wir werden Sie bald kontaktieren',
            'CONTACT_RATE_LIMITED' => 'Bitte warten Sie, bevor Sie eine weitere Nachricht senden',
            'CONTACT_INVALID_DATA' => 'Bitte überprüfen Sie Ihre Informationen und versuchen Sie es erneut',
            
            // 产品相关错误
            'PRODUCTS_LOAD_FAILED' => 'Produktladen fehlgeschlagen',
            'PRODUCT_DETAILS_LOAD_FAILED' => 'Laden der Produktdetails fehlgeschlagen',
            
            // 翻译相关错误
            'API_KEY_NOT_CONFIGURED' => 'OpenAI API-Schlüssel nicht konfiguriert, bitte .htaccess-Datei überprüfen',
            'INVALID_ACTION' => 'Nicht unterstützter Operationstyp',
            'EMPTY_CONTENT' => 'Produktname und -beschreibung können nicht gleichzeitig leer sein',
            'INVALID_TARGET_LANGUAGES' => 'Zielsprachenliste kann nicht leer sein',
            'UNSUPPORTED_SOURCE_LANGUAGE' => 'Nicht unterstützte Quellsprache',
            'UNSUPPORTED_TARGET_LANGUAGE' => 'Nicht unterstützte Zielsprache: {lang}',
            'MISSING_PRODUCT_ID' => 'Produkt-ID kann nicht leer sein',
            'EMPTY_TRANSLATIONS' => 'Übersetzungsinhalt kann nicht leer sein',
            'DB_PREPARE_FAILED' => 'Datenbankvorbereitung fehlgeschlagen: {error}',
            'DB_EXECUTE_FAILED' => 'Datenbankausführung fehlgeschlagen: {error}',
            'TX_FAILED' => 'Übersetzungsspeicherung fehlgeschlagen: {error}',
        ],
        
        'es' => [
            // 通用错误
            'METHOD_NOT_ALLOWED' => 'Solo se admite el método POST',
            'INVALID_JSON' => 'Formato de datos JSON inválido',
            'RATE_LIMITED' => 'Demasiadas solicitudes. Inténtalo más tarde',
            'REQUIRED_FIELD' => 'Campo requerido faltante: {field}',
            'INVALID_EMAIL' => 'Por favor proporcione una dirección de email válida',
            'INVALID_LENGTH' => 'La longitud debe estar entre {min} y {max} caracteres',
            'DATABASE_CONNECTION_FAILED' => 'Falló la conexión a la base de datos',
            'UNAUTHORIZED_ACCESS' => 'Acceso no autorizado. Por favor inicie sesión primero',
            'UNSUPPORTED_METHOD' => 'Método no soportado',
            'PRODUCT_NOT_FOUND' => 'Producto no encontrado',
            'TRANSLATION_FAILED' => 'Traducción falló',
            'SAVE_FAILED' => 'Operación de guardado falló',
            
            // 联系表单错误
            'CONTACT_SENT_SUCCESS' => '¡Mensaje enviado con éxito! Te contactaremos pronto',
            'CONTACT_RATE_LIMITED' => 'Espera antes de enviar otro mensaje',
            'CONTACT_INVALID_DATA' => 'Verifica tu información e inténtalo de nuevo',
            
            // 产品相关错误
            'PRODUCTS_LOAD_FAILED' => 'Falló la carga de productos',
            'PRODUCT_DETAILS_LOAD_FAILED' => 'Falló la carga de detalles del producto',
            
            // 翻译相关错误
            'API_KEY_NOT_CONFIGURED' => 'Clave API de OpenAI no configurada, por favor verifica el archivo .htaccess',
            'INVALID_ACTION' => 'Tipo de operación no soportado',
            'EMPTY_CONTENT' => 'El nombre y descripción del producto no pueden estar vacíos al mismo tiempo',
            'INVALID_TARGET_LANGUAGES' => 'La lista de idiomas objetivo no puede estar vacía',
            'UNSUPPORTED_SOURCE_LANGUAGE' => 'Idioma fuente no soportado',
            'UNSUPPORTED_TARGET_LANGUAGE' => 'Idioma objetivo no soportado: {lang}',
            'MISSING_PRODUCT_ID' => 'El ID del producto no puede estar vacío',
            'EMPTY_TRANSLATIONS' => 'El contenido de la traducción no puede estar vacío',
            'DB_PREPARE_FAILED' => 'Preparación de base de datos falló: {error}',
            'DB_EXECUTE_FAILED' => 'Ejecución de base de datos falló: {error}',
            'TX_FAILED' => 'Guardado de traducción falló: {error}',
        ],
        
        'it' => [
            // 通用错误
            'METHOD_NOT_ALLOWED' => 'È supportato solo il metodo POST',
            'INVALID_JSON' => 'Formato dati JSON non valido',
            'RATE_LIMITED' => 'Troppe richieste. Riprova più tardi',
            'REQUIRED_FIELD' => 'Campo richiesto mancante: {field}',
            'INVALID_EMAIL' => 'Fornisci un indirizzo email valido',
            'INVALID_LENGTH' => 'La lunghezza dovrebbe essere tra {min} e {max} caratteri',
            'DATABASE_CONNECTION_FAILED' => 'Connessione al database fallita',
            'UNAUTHORIZED_ACCESS' => 'Accesso non autorizzato. Effettua prima il login',
            'UNSUPPORTED_METHOD' => 'Metodo non supportato',
            'PRODUCT_NOT_FOUND' => 'Prodotto non trovato',
            'TRANSLATION_FAILED' => 'Traduzione fallita',
            'SAVE_FAILED' => 'Operazione di salvataggio fallita',
            
            // 联系表单错误
            'CONTACT_SENT_SUCCESS' => 'Messaggio inviato con successo! Ti contatteremo presto',
            'CONTACT_RATE_LIMITED' => 'Aspetta prima di inviare un altro messaggio',
            'CONTACT_INVALID_DATA' => 'Controlla le tue informazioni e riprova',
            
            // 产品相关错误
            'PRODUCTS_LOAD_FAILED' => 'Caricamento prodotti fallito',
            'PRODUCT_DETAILS_LOAD_FAILED' => 'Caricamento dettagli prodotto fallito',
            
            // 翻译相关错误
            'API_KEY_NOT_CONFIGURED' => 'Chiave API OpenAI non configurata, controlla il file .htaccess',
            'INVALID_ACTION' => 'Tipo di operazione non supportato',
            'EMPTY_CONTENT' => 'Nome e descrizione del prodotto non possono essere vuoti contemporaneamente',
            'INVALID_TARGET_LANGUAGES' => 'La lista delle lingue target non può essere vuota',
            'UNSUPPORTED_SOURCE_LANGUAGE' => 'Lingua sorgente non supportata',
            'UNSUPPORTED_TARGET_LANGUAGE' => 'Lingua target non supportata: {lang}',
            'MISSING_PRODUCT_ID' => 'L\'ID del prodotto non può essere vuoto',
            'EMPTY_TRANSLATIONS' => 'Il contenuto della traduzione non può essere vuoto',
            'DB_PREPARE_FAILED' => 'Preparazione database fallita: {error}',
            'DB_EXECUTE_FAILED' => 'Esecuzione database fallita: {error}',
            'TX_FAILED' => 'Salvataggio traduzione fallito: {error}',
        ]
    ];
}

/**
 * 从请求头或参数中获取语言代码
 * @return string 语言代码
 */
function get_request_language() {
    // 优先从Accept-Language头获取
    if (isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
        $accept_lang = $_SERVER['HTTP_ACCEPT_LANGUAGE'];
        $langs = explode(',', $accept_lang);
        foreach ($langs as $lang) {
            $lang = trim(explode(';', $lang)[0]);
            if (in_array($lang, ['en', 'fr', 'de', 'es', 'it'])) {
                return $lang;
            }
            // 处理语言代码如 en-US, fr-FR 等
            $lang_code = explode('-', $lang)[0];
            if (in_array($lang_code, ['en', 'fr', 'de', 'es', 'it'])) {
                return $lang_code;
            }
        }
    }
    
    // 从URL参数获取
    if (isset($_GET['lang'])) {
        $lang = $_GET['lang'];
        if (in_array($lang, ['en', 'fr', 'de', 'es', 'it'])) {
            return $lang;
        }
    }
    
    // 默认返回英语
    return 'en';
}

/**
 * 发送多语言错误响应
 * @param int $status_code HTTP状态码
 * @param string $error_code 错误代码
 * @param array $params 参数替换数组
 * @param string $lang 语言代码
 */
function json_error_response($status_code, $error_code, $params = [], $lang = null) {
    if ($lang === null) {
        $lang = get_request_language();
    }
    
    $message = get_error_message($error_code, $lang, $params);
    
    $response = [
        'success' => false,
        'error' => [
            'code' => $error_code,
            'message' => $message,
            'language' => $lang
        ]
    ];
    
    json_response($status_code, $response);
}

/**
 * 发送多语言成功响应
 * @param int $status_code HTTP状态码
 * @param string $success_code 成功代码
 * @param array $data 响应数据
 * @param array $params 参数替换数组
 * @param string $lang 语言代码
 */
function json_success_response($status_code, $success_code, $data = [], $params = [], $lang = null) {
    if ($lang === null) {
        $lang = get_request_language();
    }
    
    $message = get_error_message($success_code, $lang, $params);
    
    $response = [
        'success' => true,
        'message' => $message,
        'language' => $lang,
        'data' => $data
    ];
    
    json_response($status_code, $response);
}
?>
