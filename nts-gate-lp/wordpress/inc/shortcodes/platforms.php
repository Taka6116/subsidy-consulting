<?php
/**
 * プラットフォームセクション ショートコード
 *
 * 使用方法: [nts_platforms]
 *
 * functions.php に以下を追加:
 *   require_once get_template_directory() . '/inc/shortcodes/platforms.php';
 *
 * @package NTS
 */

if (!defined('ABSPATH')) {
    exit;
}

function nts_platforms_shortcode() {
    ob_start();
    get_template_part('template-parts/section', 'platforms');
    return ob_get_clean();
}
add_shortcode('nts_platforms', 'nts_platforms_shortcode');

function nts_platforms_styles() {
    wp_enqueue_style(
        'nts-platforms',
        get_template_directory_uri() . '/assets/css/section-platforms.css',
        array(),
        '1.0.0'
    );
}
add_action('wp_enqueue_scripts', 'nts_platforms_styles');
