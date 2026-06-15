<?php
/**
 * NTS プラットフォームサービス紹介セクション
 *
 * 使用方法:
 *   <?php get_template_part('template-parts/section', 'platforms'); ?>
 *
 * @package NTS
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<section class="nts-platforms-section">
  <div class="nts-platforms-inner">

    <div class="nts-platforms-header">
      <p class="nts-platforms-label">Feature</p>
      <h2 class="nts-platforms-en-title">PLATFORMS</h2>
      <p class="nts-platforms-ja-title">補助金サービス・プラットフォーム</p>
      <p class="nts-platforms-desc">
        日本提携支援は、M&amp;A支援で培った経営課題への深い理解をもとに、<br>
        補助金活用の3つのプラットフォームを提供しています。
      </p>
    </div>

    <div class="nts-platforms-grid">

      <article class="nts-platform-card">
        <div class="nts-platform-card__index">01</div>
        <div class="nts-platform-card__icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="8" y="4" width="28" height="36" rx="3" stroke="#28A4A3" stroke-width="2.5" fill="none"/>
            <path d="M14 14h20M14 20h20M14 26h14" stroke="#28A4A3" stroke-width="2" stroke-linecap="round"/>
            <circle cx="36" cy="36" r="8" fill="#28A4A3"/>
            <path d="M33 36l2 2 4-4" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="nts-platform-card__label">補助金を活用したい経営者様へ</div>
        <h3 class="nts-platform-card__title">
          その経営課題、<br>補助金で動かせるかもしれません。
        </h3>
        <p class="nts-platform-card__body">
          人手不足、設備の老朽化、事業承継——。
          3つの質問に答えるだけで、御社に活用できる可能性のある補助金をご案内します。
        </p>
        <a
          href="https://subsidy-consulting-nts.vercel.app/"
          class="nts-platform-card__cta"
          target="_blank"
          rel="noopener noreferrer"
        >
          補助金の可能性を診断する
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </article>

      <article class="nts-platform-card nts-platform-card--featured">
        <div class="nts-platform-card__index">02</div>
        <div class="nts-platform-card__icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="10" cy="24" r="5" stroke="white" stroke-width="2.5" fill="none"/>
            <circle cx="38" cy="24" r="5" stroke="white" stroke-width="2.5" fill="none"/>
            <circle cx="24" cy="12" r="5" stroke="white" stroke-width="2.5" fill="none"/>
            <path d="M15 24h18M24 17v7" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <path d="M19 28l-6 0M29 28l6 0" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="nts-platform-card__label">提携をご検討のパートナー様へ</div>
        <h3 class="nts-platform-card__title">
          「補助金が使えますよ」——<br>その一言が、営業を変える。
        </h3>
        <p class="nts-platform-card__body">
          御社の商材・サービスが補助金の対象になる可能性があります。
          紹介するだけで、あとは日本提携支援が動きます。
          提携先プログラムの詳細はこちら。
        </p>
        <a
          href="https://subsidy-consulting-nts.vercel.app/partner"
          class="nts-platform-card__cta nts-platform-card__cta--white"
          target="_blank"
          rel="noopener noreferrer"
        >
          提携先プログラムを見る
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </article>

      <article class="nts-platform-card">
        <div class="nts-platform-card__index">03</div>
        <div class="nts-platform-card__icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 36l10-12 8 6 10-14 8 8" stroke="#28A4A3" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <circle cx="40" cy="10" r="4" fill="#28A4A3"/>
            <path d="M38 24h6M38 28h4M38 32h6" stroke="#28A4A3" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
          </svg>
        </div>
        <div class="nts-platform-card__label">補助金情報をいち早く知りたい方へ</div>
        <h3 class="nts-platform-card__title">
          最新の補助金情報を、<br>いち早くお届けします。
        </h3>
        <p class="nts-platform-card__body">
          省力化補助金、事業承継補助金など、中小企業が活用できる
          国の支援制度を一覧で確認できます。
          自社に関係する補助金をすぐに探せます。
        </p>
        <a
          href="https://subsidy-consulting-nts.vercel.app/subsidies"
          class="nts-platform-card__cta"
          target="_blank"
          rel="noopener noreferrer"
        >
          補助金情報を探す
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </article>

    </div>
  </div>
</section>
