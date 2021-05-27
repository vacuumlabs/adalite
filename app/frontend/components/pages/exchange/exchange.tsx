import {h} from 'preact'
import styles from './exchange.module.scss'
import {ADALITE_CONFIG} from '../../../config'
const APP_VERSION = ADALITE_CONFIG.ADALITE_APP_VERSION

const Exchange = () => (
  <div className="wrap">
    <nav className="navbar">
      <div className={`navbar-wrapper ${styles.navbarWrapper}`}>
        <h1 className={`navbar-heading ${styles.navbarHeading}`}>
          <span className={`navbar-title ${styles.navbarTitle}`}>AdaLite - Cardano Wallet</span>
          <a href="/">
            <img
              src="assets/adalite-logo.svg"
              alt="AdaLite - Cardano Wallet"
              className="navbar-logo"
            />
          </a>
        </h1>
        <div className={`navbar-version ${styles.navbarVersion}`}>{`Ver. ${APP_VERSION}`}</div>
      </div>
    </nav>
    <div className={`${styles.content}`}>
      <div className={`card ${styles.card}`}>
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          src="https://widget.changelly.com?from=zrx%2Czil%2Czen%2Czec%2Czcl%2Czap%2Cyfi%2Cxzc%2Cxvg%2Cxtz%2Cxrc%2Cxmr%2Cxmo%2Cxlm%2Cxem%2Cxdn%2Cxaur%2Cwtc%2Cwings%2Cwaxp%2Cwax%2Cwaves%2Cwabi%2Cvlx%2Cvib%2Cvgx%2Cvet%2Cven%2Cutk%2Cusnbt%2Cusdt20%2Cusdt%2Cusdc%2Cuni%2Ctusd%2Ctrx%2Ctrst%2Ctrigx%2Cton%2Ctomo%2Ctnb%2Ctkn%2Ctime%2Ctheta%2Ctel%2Csys%2Csybc%2Cswt%2Csub%2Cstx%2Cstrax%2Cstrat%2Cstorm%2Cstorj%2Csteem%2Csolve%2Csolo%2Csol%2Csnt%2Csnm%2Csngls%2Csmart%2Cskin%2Csbd%2Csalt%2Crvn%2Croobee%2Crlc%2Crfr%2Creq%2Crepv2%2Crep%2Crdn%2Crcn%2Crads%2Cr%2Cqtum%2Cqsp%2Cqcn%2Cptoy%2Cpsl%2Cpsg%2Cproc%2Cppt%2Cppc%2Cpowr%2Cpot%2Cpoly%2Cpoe%2Cpma%2Cpltc%2Cplr%2Cpivx%2Cphx%2Cphb%2Cpay%2Cpaxg%2Cpax%2Cpat%2Cpart%2Cont%2Cong%2Cone%2Comg%2Cokb%2Cnxt%2Cnut%2Cnrg%2Cnoah%2Cnmr%2Cnlg%2Cnim%2Cngc%2Cnexo%2Cneo%2Cnebl%2Cnav%2Cnano%2Cmyst%2Cmtl%2Cmo%2Cmln%2Cmkr%2Cmith%2Cmco%2Cmatic%2Cmana%2Cmaid%2Clun%2Cltc%2Clsk%2Clrc%2Cloom%2Clink%2Clevl%2Cleo%2Clbc%2Cknc%2Ckmd%2Ckin-old%2Ckin%2Ckick%2Cjuv%2Ciqq%2Ciotx%2Ciota%2Ciost%2Cignis%2Cidrt%2Cicx%2Cicp%2Cht%2Chsr%2Chmq%2Chex%2Chedg%2Chbar%2Cgvt%2Cgusd%2Cgup%2Cgrt%2Cgrs%2Cgolos%2Cgnt%2Cgno%2Cglm%2Cghost%2Cgbyte%2Cgbg%2Cgasp%2Cgas%2Cgame%2Cfun%2Cftt%2Cfront%2Cfiro%2Cfio%2Cfil%2Cfet%2Cfcn%2Cexp%2Cexm%2Ceurs%2Cetn%2Cethos%2Cetc%2Cesh%2Cerk%2Ceosdt%2Ceos%2Cenj%2Celf%2Cegld%2Cedg%2Cdsh%2Cdov%2Cdot%2Cdoge%2Cdnt%2Cdgtx%2Cdgd%2Cdgb%2Cdent%2Cddrt%2Cddr%2Cdct%2Cdcr%2Cdcn%2Cdash%2Cdar%2Cdai%2Ccvc%2Ccur%2Cctsi%2Cctr%2Ccro%2Ccoti%2Ccomp%2Ccns%2Ccnd%2Ccmt%2Ccl%2Cckb%2Cchz%2Ccfi%2Cbusd%2Cbtt%2Cbtg%2Cbtcv%2Cbtcp%2Cbsv%2Cbrg%2Cbrd%2Cbnt%2Cbnb%2Cbkx%2Cbetr%2Cbet%2Cbdg%2Cbcn%2Cbch%2Cbcd%2Cbat%2Caya%2Cava%2Catri%2Catom%2Catl%2Cast%2Casp%2Carrr%2Carn%2Cark%2Cardr%2Cappc%2Cant%2Camp%2Calgo%2Caion%2Caeon%2Cae%2Cadx%2Cadk%2Cada%2Cacm%2Cabyss%2Caave%2C1st%2Cxrp%2Ceth%2Cbtc&to=zrx%2Czil%2Czen%2Czec%2Czcl%2Czap%2Cyfi%2Cxzc%2Cxvg%2Cxtz%2Cxrc%2Cxmr%2Cxmo%2Cxlm%2Cxem%2Cxdn%2Cxaur%2Cwtc%2Cwings%2Cwaxp%2Cwax%2Cwaves%2Cwabi%2Cvlx%2Cvib%2Cvgx%2Cvet%2Cven%2Cutk%2Cusnbt%2Cusdt20%2Cusdt%2Cusdc%2Cuni%2Ctusd%2Ctrx%2Ctrst%2Ctrigx%2Cton%2Ctomo%2Ctnb%2Ctkn%2Ctime%2Ctheta%2Ctel%2Csys%2Csybc%2Cswt%2Csub%2Cstx%2Cstrax%2Cstrat%2Cstorm%2Cstorj%2Csteem%2Csolve%2Csolo%2Csol%2Csnt%2Csnm%2Csngls%2Csmart%2Cskin%2Csbd%2Csalt%2Crvn%2Croobee%2Crlc%2Crfr%2Creq%2Crepv2%2Crep%2Crdn%2Crcn%2Crads%2Cr%2Cqtum%2Cqsp%2Cqcn%2Cptoy%2Cpsl%2Cpsg%2Cproc%2Cppt%2Cppc%2Cpowr%2Cpot%2Cpoly%2Cpoe%2Cpma%2Cpltc%2Cplr%2Cpivx%2Cphx%2Cphb%2Cpay%2Cpaxg%2Cpax%2Cpat%2Cpart%2Cont%2Cong%2Cone%2Comg%2Cokb%2Cnxt%2Cnut%2Cnrg%2Cnoah%2Cnmr%2Cnlg%2Cnim%2Cngc%2Cnexo%2Cneo%2Cnebl%2Cnav%2Cnano%2Cmyst%2Cmtl%2Cmo%2Cmln%2Cmkr%2Cmith%2Cmco%2Cmatic%2Cmana%2Cmaid%2Clun%2Cltc%2Clsk%2Clrc%2Cloom%2Clink%2Clevl%2Cleo%2Clbc%2Cknc%2Ckmd%2Ckin-old%2Ckin%2Ckick%2Cjuv%2Ciqq%2Ciotx%2Ciota%2Ciost%2Cignis%2Cidrt%2Cicx%2Cicp%2Cht%2Chsr%2Chmq%2Chex%2Chedg%2Chbar%2Cgvt%2Cgusd%2Cgup%2Cgrt%2Cgrs%2Cgolos%2Cgnt%2Cgno%2Cglm%2Cghost%2Cgbyte%2Cgbg%2Cgasp%2Cgas%2Cgame%2Cfun%2Cftt%2Cfront%2Cfiro%2Cfio%2Cfil%2Cfet%2Cfcn%2Cexp%2Cexm%2Ceurs%2Cetn%2Cethos%2Cetc%2Cesh%2Cerk%2Ceosdt%2Ceos%2Cenj%2Celf%2Cegld%2Cedg%2Cdsh%2Cdov%2Cdot%2Cdoge%2Cdnt%2Cdgtx%2Cdgd%2Cdgb%2Cdent%2Cddrt%2Cddr%2Cdct%2Cdcr%2Cdcn%2Cdash%2Cdar%2Cdai%2Ccvc%2Ccur%2Cctsi%2Cctr%2Ccro%2Ccoti%2Ccomp%2Ccns%2Ccnd%2Ccmt%2Ccl%2Cckb%2Cchz%2Ccfi%2Cbusd%2Cbtt%2Cbtg%2Cbtcv%2Cbtcp%2Cbsv%2Cbrg%2Cbrd%2Cbnt%2Cbnb%2Cbkx%2Cbetr%2Cbet%2Cbdg%2Cbcn%2Cbch%2Cbcd%2Cbat%2Caya%2Cava%2Catri%2Catom%2Catl%2Cast%2Casp%2Carrr%2Carn%2Cark%2Cardr%2Cappc%2Cant%2Camp%2Calgo%2Caion%2Caeon%2Cae%2Cadx%2Cadk%2Cada%2Cacm%2Cabyss%2Caave%2C1st%2Cxrp%2Ceth%2Cbtc&amount=0.1&address=&fromDefault=btc&toDefault=ada&theme=default&merchant_id=pz2lyn57ztluz5po&payment_id=&v=3"
        >
          Can't load widget
        </iframe>
      </div>
    </div>
  </div>
)

export default Exchange
