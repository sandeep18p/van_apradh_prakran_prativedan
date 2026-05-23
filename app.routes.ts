import { Routes } from '@angular/router';
import { authGuard } from './services/guard/auth.guard';

export const routes: Routes = [
  // {
  //   path: 'home',
  //   loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  // },
  {
    path: '',
    redirectTo: 'splash-page',
    pathMatch: 'full',
  },
  {
    path: 'splash-page',
    loadComponent: () => import('./pages/splash-page/splash-page.page').then(m => m.SplashPagePage)
  },
  {
    path: 'login-officer',
    loadComponent: () => import('./pages/login-officer/login-officer.page').then(m => m.LoginOfficerPage)
  },
  {
    path: 'profile-setup',
    loadComponent: () => import('./pages/profile-setup/profile-setup.page').then(m => m.ProfileSetupPage),
    canActivate: [authGuard]
  },
  {
    path: 'officer-dashboard',
    loadComponent: () => import('./pages/officer-dashboard/officer-dashboard.page').then(m => m.OfficerDashboardPage),
    canActivate: [authGuard]
  },
  {
    path: 'add-complain',
    loadComponent: () => import('./pages/add-complain/add-complain.page').then(m => m.AddComplainPage),
    canActivate: [authGuard]
  },
  {
    path: 'view-complain-detail',
    loadComponent: () => import('./pages/view-complain-detail/view-complain-detail.page').then(m => m.ViewComplainDetailPage),
    canActivate: [authGuard]
  },
  {
    path: 'emp-profile',
    loadComponent: () => import('./pages/emp-profile/emp-profile.page').then(m => m.EmpProfilePage),
    canActivate: [authGuard]
  },
  {
    path: 'complain-life-history',
    loadComponent: () => import('./pages/complain-life-history/complain-life-history.page').then(m => m.ComplainLifeHistoryPage),
    canActivate: [authGuard]
  },
  {
    path: 'ra-work-log',
    loadComponent: () => import('./pages/ra-work-log/ra-work-log.component').then(m => m.RaWorkLogComponent),
    canActivate: [authGuard]
  },
  {
    path: 'offline-data-list',
    loadComponent: () => import('./pages/offline-por-list/offline-por-list.component').then(m => m.OfflinePorListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'ra-work-log-list',
    loadComponent: () => import('./pages/show-ra-work-log/show-ra-work-log.component').then(m => m.ShowRaWorkLogComponent),
    canActivate: [authGuard]
  },
  {
    path: 'view-one-offline-data-detail',
    loadComponent: () =>
      import('./pages/view-one-offline-data-detail/view-one-offline-data-detail.component')
        .then(m => m.ViewOneOfflineDataDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'edit-offline-complain-detail',
    loadComponent: () => import('./pages/edit-offline-complain/edit-offline-complain.component').then(m => m.EditOfflineComplainComponent),
    canActivate: [authGuard]
  },

  {
    path: 'view-complain-detail2',
    loadComponent: () => import('./pages/view-complain-detail2/view-complain-detail.page2').then(m => m.ViewComplainDetailPage2),
    canActivate: [authGuard]
  },

  {
    path: 'submit-van-apradh-prakaran-by-ra',
    loadComponent: () => import('./pages/submit-van-apradh-prakaran-by-ra/submit-van-apradh-prakaran-by-ra.component').then(m => m.SubmitVanApradhPrakaranByRaComponent),
    canActivate: [authGuard]
  },

  {
    path: 'submit-vasuli-viran-page',
    loadComponent: () => import('./pages/submit-vasuli-viran-page/submit-vasuli-viran-page.component').then(m => m.SubmitVasuliViranPageComponent),
    canActivate: [authGuard]
  },

  {
    path: 'submit-parivahan-page',
    loadComponent: () => import('./pages/submit-parivahan-page/submit-parivahan-page.component').then(m => m.SubmitParivahanPageComponent),
    canActivate: [authGuard]
  },

  {
    path: 'signature',
    loadComponent: () => import('./pages/signature-page/signature-page.component').then(m => m.SignaturePageComponent),
    canActivate: [authGuard]
  },

  {
    path: 'janch-samay-vridhi-request',
    loadComponent: () => import('./pages/submit-janch-extend-request/submit-janch-extend-request.component').then(m => m.SubmitJanchExtendRequestComponent),
    canActivate: [authGuard]
  }
  ,

  {
    path: 'janch_awadhi_badhane_hetu_kiye_gaye_awedan',
    loadComponent: () => import('./pages/show-submited-request-to-extend-janch-awadhi/show-submited-request-to-extend-janch-awadhi.component').then(m => m.ShowSubmitedRequestToExtendJanchAwadhiComponent),
    canActivate: [authGuard]
  },

  {
    path: 'pdf_viewer_component',
    loadComponent: () => import('./dialogs/pdf-viewer-dialog/pdf-viewer-dialog.component').then(m => m.PdfViewerDialogComponent)
  },

  {
    path: 'pdf_viewer_component_new',
    loadComponent: () => import('./dialogs/pdf-viewer-dialog-new/pdf-viewer-dialog-new.component').then(m => m.PdfViewerDialogNewComponent)
  },

  {
    path: 'submit-dr-detail-page',
    loadComponent: () => import('./pages/submit-dr-entry-page/submit-dr-entry-page.component').then(m => m.SubmitDrEntryPageComponent),
    canActivate: [authGuard]
  },

  {
    path: 'pradhikrit-adhikari-ko-suchna-by-ro',
    loadComponent: () => import('./pages/pradhikrit-adhikari-ko-suchna-by-ro/pradhikrit-adhikari-ko-suchna-by-ro.component').then(m => m.SubmitSuchnaToPradhikritAdhikariComponent),
    canActivate: [authGuard]
  },

  {
    path: 'court-challan-dastawej-list',
    loadComponent: () => import('./pages/submit-courtchallan-dastawej/submit-courtchallan-dastawej.component').then(m => m.CourtChallanDastawejList),
    canActivate: [authGuard]
  },

  {
    path: 'giraftari-fard',
    loadComponent: () => import('./pages/giraftari-fard-page/giraftari-fard-page.component').then(m => m.GiraftariFardComponent),
    canActivate: [authGuard]
  },

  {
    path: 'admin-officer-dashboard',
    loadComponent: () => import('./pages/admin-officer-dashboard/admin-officer-dashboard.page').then(m => m.AdminOfficerDashboard),
    canActivate: [authGuard]
  },

  // {
  //   path: 'loginas',
  //   loadComponent: () => import('.').then(m => m.LoginasPage),
  //   canActivate: [authGuard]
  // },

  {
    path: 'loginas',
    loadComponent: () => import('./pages/loginas/loginas.page').then(m => m.LoginasPage),
    canActivate: [authGuard]
  },

  {
    path: 'officer-dashboard-after-click-from-admin-dashaboard',
    loadComponent: () => import('./pages/officer-dashboard-after-click-from-admin-dashboard/officer-dashboard-after-click-from-admin-dashboard.page').then(m => m.OfficerDashboardAfterClickFromAdminDashbaordPage),
    canActivate: [authGuard]
  },

  {
    path: 'add-complain-new',
    loadComponent: () => import('./pages/add-complain-new/add-complain-new.page').then(m => m.AddComplainNewPage),
    canActivate: [authGuard]
  },

  {
    path: 'giraftari-suchna',
    loadComponent: () => import('./pages/giraftari-suchna-page/giraftari-suchna-page.component').then(m => m.GiraftariSuchanaComponent),
    canActivate: [authGuard]
  },

  {
    path: 'challan-form',
    loadComponent: () => import('./pages/challan-form/challan-form.page').then(m => m.ChallanFormPage),
    canActivate: [authGuard]
  },

  {
    path: 'check-list',
    loadComponent: () => import('./pages/check-list/check-list.page').then(m => m.CheckListPage),
    canActivate: [authGuard]
  },

  {
    path: 'remad-form',
    loadComponent: () => import('./pages/remand-form/remand-form.page').then(m => m.RemandFormPage),
    canActivate: [authGuard]
  },

  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },


  {
    path: 'new_pdf_viewer_component',
    loadComponent: () => import('./dialogs/new-pdf-viewer-dialog/pdf-new-viewer-dialog.component').then(m => m.NewPdfViewerDialogComponent)
  },

  {
    path: 'submit-van-apradh-prakaran-by-ra-for-beat-nirikshan',
    loadComponent: () => import('./pages/submit-van-apradh-prakaran-by-ra-beat-nirikshan-por/submit-van-apradh-prakaran-by-ra-beat-nirikshan-por.component').then(m => m.SubmitVanApradhPrakaranByRaForBeatNirikshanComponent),
    canActivate: [authGuard]
  },

  {
    path: 'apradhiyo-ki-suchi',
    loadComponent: () => import('./pages/apradhiyo-ki-suchi/apradhiyo-ki-suchi.page').then(m => m.ApradhiyoKiSuchiPage),
    canActivate: [authGuard]
  },

  {
    path: 'sakshiyo-ki-suchi',
    loadComponent: () => import('./pages/sakshiyo-ki-suchi/sakshiyo-ki-suchi.page').then(m => m.SakshiyoKiSuchiPage),
    canActivate: [authGuard]
  },

  {
    path: 'view-complain-detail3',
    loadComponent: () => import('./pages/view-complain-detail3/view-complain-detail.page3').then(m => m.ViewComplainDetailPage3),
    canActivate: [authGuard]
  },

  {
    path: 'jantri-page',
    loadComponent: () => import('./pages/jantri-page/jantri-page.page').then(m => m.JantriPage)
  },

  {
    path: 'employee-list',
    loadComponent: () => import('./pages/employee-list/employee-list.page').then(m => m.EmployeeListPage),
    canActivate: [authGuard]
  },

  {
    path: 'add-japtinama-vivran',
    loadComponent: () => import('./pages/add-japtinama/add-japtinama.page').then(m => m.AddJaptinamaPage),
    canActivate: [authGuard]
  },

  {
    path: 'add-supurdnama-vivran',
    loadComponent: () => import('./pages/add-supurdnama/add-supurdnama.page').then(m => m.AddSupurdnamaPage),
    canActivate: [authGuard]
  },
  {
    path: 'parivahan-related-report',
    loadComponent: () => import('./pages/parivahan-related-report/parivahan-related-report.page').then(m => m.ParivahanRelatedReportPage),
    canActivate: [authGuard]
  }


];
