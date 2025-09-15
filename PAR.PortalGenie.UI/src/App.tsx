
import React, { useState } from 'react'
import './assets/styles/phosphor.css'
import './assets/styles/bootstrap.css'
import './assets/styles/app.css'

import { ChatDrawer } from './components/ChatDrawer'

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="layout">
      <Header onOpenGenie={() => setDrawerOpen(true)} />
      <div className="body">
        <Sidebar />
        <Main />
      </div>

      <ChatDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}

function Header({ onOpenGenie }: { onOpenGenie: () => void }) {
  return (
    <header className="header">
      <div className="brand">
        <div className="logo" aria-hidden> </div>
      </div>
      <div className="actions">
        <button className="btn genie" onClick={onOpenGenie} aria-haspopup="dialog">
          ✨ PAR Genie
        </button>
        <div className="logout"><i className="ph ph-sign-out"></i>&nbsp;Logout</div>
      </div>
    </header>
  )
}

function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-header user_side">
        <h5>Akshit Sharma</h5>
        <a href="/Account/Index/"><i className="ph ph-user"></i> My Account</a>

      </div>

      <ul className="list-unstyled components sidebar-nav mb50">
        <li>
          <a className="accordion-heading accordion-toggle b_9FDDF6 active" data-toggle="collapse" data-parent="#accordion2" href="#collapse1"><i className="ph ph-cloud"></i> <span>Admin</span></a>
          <ul className=" list-unstyled" id="collapse1">
            <li className="accordion-inner"><a className="active" href="/Admin/Groups/">Groups</a></li>
            <li className="accordion-inner"><a className="" href="/Admin/Tools/">Tools</a></li>
            <li className="accordion-inner"><a className="" href="/Admin/GlobalSettings/">Global Settings</a></li>
            <li className="accordion-inner"><a className="" href="/Admin/Users/?UserType=Administrator">Admin Users</a></li>
            <li className="accordion-inner"><a className="" href="/Admin/Roles/">Admin Roles</a></li>
            <li className="accordion-inner"><a className="" href="/Admin/WebServiceAccounts/">API Accounts</a></li>
            <li className="accordion-inner"><a className="" href="/Admin/Domains/">Domains</a></li>
            <li className="accordion-inner"><a className="" href="/Admin/Upgrade/">Upgrade</a></li>

          </ul>
        </li>
        <li>

          <a className="accordion-heading accordion-toggle b_9FDDF6 collapsed" data-toggle="collapse" data-parent="#accordion2" href="#collapse2"><i className="ph ph-question"></i> <span>Help</span></a>
          <ul className="collapse list-unstyled" id="collapse2">
            <li className="accordion-inner"><a className="" href="/Help/Contact/">Contact Support</a></li>
            <li className="accordion-inner"><a href="http://cdn.brinkpos.net/Documentation.html" target="_blank">Documentation</a></li>
            <li className="accordion-inner"><a className="" href="/Help/Downloads/">Downloads</a></li>
            <li className="accordion-inner"><a className="" href="https://kb.partech.com" target="_blank">View Help Articles</a></li>
          </ul>

        </li>
      </ul >
    </nav >
  )
}

function Main() {
  return (
    <main className="content">
      <div className="">
        <div className="row">
          <div className="col-md-12">
            <div className="pull-right">
              <span className="btn-group">
                <a className="btn btn-sm btn-success" href="/Admin/WebServiceAccounts/Edit/00000000-0000-0000-0000-000000000000"><i className="ph ph-plus"></i> New Group</a>
              </span>
            </div>

            <ul className="breadcrumb">
              <li className="active">Groups</li>
            </ul>
          </div>
        </div>

        <div className="col-md-12">
          <table className="dxgvControl dxgv" id="gvGroups" style={{ width: "100%", borderCollapse: "separate" }}>
            <tbody><tr>
              <td><table id="gvGroups_DXMainTable" className="dxgvTable dxgvRBB" style={{ width: "100%", emptyCells: "show" }}>
                <tbody><tr id="gvGroups_DXHeadersRow0">
                  <td id="gvGroups_col0" className="dxgvHeader" style={{ borderTopWidth: "0px", borderLeftWidth: "0px" }}><table style={{ width: "100%" }}>
                    <tbody><tr>
                      <td>Group Name</td><td style={{ width: "1px", textAlign: "right" }}><span className="dx-vam">&nbsp;</span></td>
                    </tr>
                    </tbody></table></td><td id="gvGroups_col1" className="dxgvHeader" style={{ borderTopWidth: "0px", borderLeftWidth: "0px", borderRightWidth: "0px" }}><table style={{ width: "100%" }}>
                      <tbody><tr>
                        <td>Locations</td><td style={{ width: "1px", textAlign: "right" }}><span className="dx-vam">&nbsp;</span></td>
                      </tr>
                      </tbody></table></td>
                </tr><tr id="gvGroups_DXFilterRow" className="dxgvFilterRow">
                    <td className="dxgv"><table style={{ width: "100%" }}>
                      <tbody><tr>
                        <td style={{ width: "100%", paddingRight: "2px" }}><table className="dxeTextBoxSys dxeTextBox dxeTextBoxDefaultWidthSys" id="gvGroups_DXFREditorcol0" style={{ width: "100%" }}>
                          <tbody><tr>
                            <td className="dxic" style={{ width: "100%" }}><input className="dxeEditArea dxeEditAreaSys" id="gvGroups_DXFREditorcol0_I" name="gvGroups$DXFREditorcol0" type="text" /></td>
                          </tr>
                          </tbody></table></td><td>
                            {/* <img className="dxGridView_gvFilterRowButton" src="/DXR.axd?r=1_87-i7Gvq" alt="Open filter row popup menu" style={{ cursor: "pointer" }} /> */}
                            </td>
                      </tr>
                      </tbody></table></td><td className="dxgv" style={{ textAlign: "right", borderRightWidth: "0px" }}><table style={{ width: "100%" }}>
                        <tbody><tr>
                          <td style={{ width: "100%", paddingRight: "2px" }}><table className="dxeTextBoxSys dxeTextBox dxeTextBoxDefaultWidthSys" id="gvGroups_DXFREditorcol1" style={{ width: "100%" }}>
                            <tbody><tr>
                              <td className="dxic" style={{ width: "100%" }}><input className="dxeEditArea dxeEditAreaSys" id="gvGroups_DXFREditorcol1_I" name="gvGroups$DXFREditorcol1" type="text" /></td>
                            </tr>
                            </tbody></table>

                          </td><td>
                            {/* <img className="dxGridView_gvFilterRowButton" src="/DXR.axd?r=1_87-i7Gvq" alt="Open filter row popup menu" style={{ cursor: "pointer" }} /> */}
                            </td>
                        </tr>
                        </tbody></table></td>
                  </tr><tr id="gvGroups_DXDataRow0" className="dxgvDataRow" >
              <td id="gvGroups_tccell0_0" className="dxgv"><div className="btn-group"><span className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">***DevOps***<span className="caret"></span></span><ul className="dropdown-menu"><li><a href="/Admin/Groups/GroupDashboard/014f7a80-484b-489e-821e-7b144f8c75a0"><i className="ph ph-gauge"></i> Dashboard</a></li><li><a href="/Admin/Groups/GroupSettingsEditor/014f7a80-484b-489e-821e-7b144f8c75a0"><i className="ph ph-gear"></i> Settings Editor</a></li><li><a href="/Admin/Groups/GroupIntegrationsPortal/014f7a80-484b-489e-821e-7b144f8c75a0" target="_blank"><i className="ph ph-plug"></i> Integrations Portal</a></li><li><a href="/Admin/Groups/GroupInStoreCredentialsPortal/014f7a80-484b-489e-821e-7b144f8c75a0" target="_blank"><i className="ph ph-key"></i> Orbit Credentials Portal</a></li><li><a className="viewDetailsClass" data-id="014f7a80-484b-489e-821e-7b144f8c75a0"><i className="ph ph-list"></i> Details</a></li><li><a href="/Admin/Groups/Edit/014f7a80-484b-489e-821e-7b144f8c75a0"><i className="ph ph-pencil"></i> Edit</a></li><li className="divider"></li><li><a href="/Admin/Groups/GroupTools?gid=014f7a80-484b-489e-821e-7b144f8c75a0"><i className="ph ph-wrench"></i> Tools</a></li></ul></div></td><td id="gvGroups_tccell0_1" className="dxgv dx-ar" style={{borderRightWidth:"0px"}}><a href="/Admin/Locations/View/014f7a80-484b-489e-821e-7b144f8c75a0" style={{textDecoration: "underline"}}>2 Locations</a></td>
                  </tr><tr id="gvGroups_DXDataRow1" className="dxgvDataRow" >
                    <td id="gvGroups_tccell1_0" className="dxgv"><div className="btn-group"><span className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">**SEG**<span className="caret"></span></span><ul className="dropdown-menu"><li><a href="/Admin/Groups/GroupDashboard/b88d7149-25bb-4c88-8626-a5690bad9825"><i className="ph ph-gauge"></i> Dashboard</a></li><li><a href="/Admin/Groups/GroupSettingsEditor/b88d7149-25bb-4c88-8626-a5690bad9825"><i className="ph ph-gear"></i> Settings Editor</a></li><li><a href="/Admin/Groups/GroupIntegrationsPortal/b88d7149-25bb-4c88-8626-a5690bad9825" target="_blank"><i className="ph ph-plug"></i> Integrations Portal</a></li><li><a href="/Admin/Groups/GroupInStoreCredentialsPortal/b88d7149-25bb-4c88-8626-a5690bad9825" target="_blank"><i className="ph ph-key"></i> Orbit Credentials Portal</a></li><li><a className="viewDetailsClass" data-id="b88d7149-25bb-4c88-8626-a5690bad9825"><i className="ph ph-list"></i> Details</a></li><li><a href="/Admin/Groups/Edit/b88d7149-25bb-4c88-8626-a5690bad9825"><i className="ph ph-pencil"></i> Edit</a></li><li className="divider"></li><li><a href="/Admin/Groups/GroupTools?gid=b88d7149-25bb-4c88-8626-a5690bad9825"><i className="ph ph-wrench"></i> Tools</a></li></ul></div></td><td id="gvGroups_tccell1_1" className="dxgv dx-ar" style={{textDecoration: "underline"}}><a href="/Admin/Locations/View/b88d7149-25bb-4c88-8626-a5690bad9825" style={{textDecoration: "underline"}}>3 Locations</a></td>
                  </tr><tr id="gvGroups_DXDataRow2" className="dxgvDataRow" >
                    <td id="gvGroups_tccell2_0" className="dxgv"><div className="btn-group"><span className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">Aayushi<span className="caret"></span></span><ul className="dropdown-menu"><li><a href="/Admin/Groups/GroupDashboard/2f365c19-6120-4422-8149-b9793ad68e07"><i className="ph ph-gauge"></i> Dashboard</a></li><li><a href="/Admin/Groups/GroupSettingsEditor/2f365c19-6120-4422-8149-b9793ad68e07"><i className="ph ph-gear"></i> Settings Editor</a></li><li><a href="/Admin/Groups/GroupIntegrationsPortal/2f365c19-6120-4422-8149-b9793ad68e07" target="_blank"><i className="ph ph-plug"></i> Integrations Portal</a></li><li><a href="/Admin/Groups/GroupInStoreCredentialsPortal/2f365c19-6120-4422-8149-b9793ad68e07" target="_blank"><i className="ph ph-key"></i> Orbit Credentials Portal</a></li><li><a className="viewDetailsClass" data-id="2f365c19-6120-4422-8149-b9793ad68e07"><i className="ph ph-list"></i> Details</a></li><li><a href="/Admin/Groups/Edit/2f365c19-6120-4422-8149-b9793ad68e07"><i className="ph ph-pencil"></i> Edit</a></li><li className="divider"></li><li><a href="/Admin/Groups/GroupTools?gid=2f365c19-6120-4422-8149-b9793ad68e07"><i className="ph ph-wrench"></i> Tools</a></li></ul></div></td><td id="gvGroups_tccell2_1" className="dxgv dx-ar" style={{textDecoration: "underline"}}><a href="/Admin/Locations/View/2f365c19-6120-4422-8149-b9793ad68e07" style={{textDecoration: "underline"}}>1 Locations</a></td>
                  </tr><tr id="gvGroups_DXDataRow3" className="dxgvDataRow">
                    <td id="gvGroups_tccell3_0" className="dxgv"><div className="btn-group"><span className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">Akki<span className="caret"></span></span><ul className="dropdown-menu"><li><a href="/Admin/Groups/GroupDashboard/5861eed1-c958-40d4-9e54-824604c86d1e"><i className="ph ph-gauge"></i> Dashboard</a></li><li><a href="/Admin/Groups/GroupSettingsEditor/5861eed1-c958-40d4-9e54-824604c86d1e"><i className="ph ph-gear"></i> Settings Editor</a></li><li><a href="/Admin/Groups/GroupIntegrationsPortal/5861eed1-c958-40d4-9e54-824604c86d1e" target="_blank"><i className="ph ph-plug"></i> Integrations Portal</a></li><li><a href="/Admin/Groups/GroupInStoreCredentialsPortal/5861eed1-c958-40d4-9e54-824604c86d1e" target="_blank"><i className="ph ph-key"></i> Orbit Credentials Portal</a></li><li><a className="viewDetailsClass" data-id="5861eed1-c958-40d4-9e54-824604c86d1e"><i className="ph ph-list"></i> Details</a></li><li><a href="/Admin/Groups/Edit/5861eed1-c958-40d4-9e54-824604c86d1e"><i className="ph ph-pencil"></i> Edit</a></li><li className="divider"></li><li><a href="/Admin/Groups/GroupTools?gid=5861eed1-c958-40d4-9e54-824604c86d1e"><i className="ph ph-wrench"></i> Tools</a></li></ul></div></td><td id="gvGroups_tccell3_1" className="dxgv dx-ar" style={{textDecoration: "underline"}}><a href="/Admin/Locations/View/5861eed1-c958-40d4-9e54-824604c86d1e" style={{textDecoration: "underline"}}>2 Locations</a></td>
                  </tr><tr id="gvGroups_DXDataRow4" className="dxgvDataRow">
                    <td id="gvGroups_tccell4_0" className="dxgv"><div className="btn-group"><span className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">Alden<span className="caret"></span></span><ul className="dropdown-menu"><li><a href="/Admin/Groups/GroupDashboard/319a04f0-49fd-4667-946e-ccca17ecb11f"><i className="ph ph-gauge"></i> Dashboard</a></li><li><a href="/Admin/Groups/GroupSettingsEditor/319a04f0-49fd-4667-946e-ccca17ecb11f"><i className="ph ph-gear"></i> Settings Editor</a></li><li><a href="/Admin/Groups/GroupIntegrationsPortal/319a04f0-49fd-4667-946e-ccca17ecb11f" target="_blank"><i className="ph ph-plug"></i> Integrations Portal</a></li><li><a href="/Admin/Groups/GroupInStoreCredentialsPortal/319a04f0-49fd-4667-946e-ccca17ecb11f" target="_blank"><i className="ph ph-key"></i> Orbit Credentials Portal</a></li><li><a className="viewDetailsClass" data-id="319a04f0-49fd-4667-946e-ccca17ecb11f"><i className="ph ph-list"></i> Details</a></li><li><a href="/Admin/Groups/Edit/319a04f0-49fd-4667-946e-ccca17ecb11f"><i className="ph ph-pencil"></i> Edit</a></li><li className="divider"></li><li><a href="/Admin/Groups/GroupTools?gid=319a04f0-49fd-4667-946e-ccca17ecb11f"><i className="ph ph-wrench"></i> Tools</a></li></ul></div></td><td id="gvGroups_tccell4_1" className="dxgv dx-ar" style={{textDecoration: "underline"}}><a href="/Admin/Locations/View/319a04f0-49fd-4667-946e-ccca17ecb11f" style={{textDecoration: "underline"}}>6 Locations</a></td>
                  </tr><tr id="gvGroups_DXDataRow5" className="dxgvDataRow" >
                    <td id="gvGroups_tccell5_0" className="dxgv"><div className="btn-group"><span className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">Aman Mehra<span className="caret"></span></span><ul className="dropdown-menu"><li><a href="/Admin/Groups/GroupDashboard/84862117-a945-4e65-9dd4-c7bc8098ec17"><i className="ph ph-gauge"></i> Dashboard</a></li><li><a href="/Admin/Groups/GroupSettingsEditor/84862117-a945-4e65-9dd4-c7bc8098ec17"><i className="ph ph-gear"></i> Settings Editor</a></li><li><a href="/Admin/Groups/GroupIntegrationsPortal/84862117-a945-4e65-9dd4-c7bc8098ec17" target="_blank"><i className="ph ph-plug"></i> Integrations Portal</a></li><li><a href="/Admin/Groups/GroupInStoreCredentialsPortal/84862117-a945-4e65-9dd4-c7bc8098ec17" target="_blank"><i className="ph ph-key"></i> Orbit Credentials Portal</a></li><li><a className="viewDetailsClass" data-id="84862117-a945-4e65-9dd4-c7bc8098ec17"><i className="ph ph-list"></i> Details</a></li><li><a href="/Admin/Groups/Edit/84862117-a945-4e65-9dd4-c7bc8098ec17"><i className="ph ph-pencil"></i> Edit</a></li><li className="divider"></li><li><a href="/Admin/Groups/GroupTools?gid=84862117-a945-4e65-9dd4-c7bc8098ec17"><i className="ph ph-wrench"></i> Tools</a></li></ul></div></td><td id="gvGroups_tccell5_1" className="dxgv dx-ar" style={{textDecoration: "underline"}}><a href="/Admin/Locations/View/84862117-a945-4e65-9dd4-c7bc8098ec17" style={{textDecoration: "underline"}}>1 Locations</a></td>
                  </tr><tr id="gvGroups_DXDataRow6" className="dxgvDataRow" >
                    <td id="gvGroups_tccell6_0" className="dxgv"><div className="btn-group"><span className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">Angelo<span className="caret"></span></span><ul className="dropdown-menu"><li><a href="/Admin/Groups/GroupDashboard/3cb113d3-8345-4784-8e31-b0c2a0b24cc6"><i className="ph ph-gauge"></i> Dashboard</a></li><li><a href="/Admin/Groups/GroupSettingsEditor/3cb113d3-8345-4784-8e31-b0c2a0b24cc6"><i className="ph ph-gear"></i> Settings Editor</a></li><li><a href="/Admin/Groups/GroupIntegrationsPortal/3cb113d3-8345-4784-8e31-b0c2a0b24cc6" target="_blank"><i className="ph ph-plug"></i> Integrations Portal</a></li><li><a href="/Admin/Groups/GroupInStoreCredentialsPortal/3cb113d3-8345-4784-8e31-b0c2a0b24cc6" target="_blank"><i className="ph ph-key"></i> Orbit Credentials Portal</a></li><li><a className="viewDetailsClass" data-id="3cb113d3-8345-4784-8e31-b0c2a0b24cc6"><i className="ph ph-list"></i> Details</a></li><li><a href="/Admin/Groups/Edit/3cb113d3-8345-4784-8e31-b0c2a0b24cc6"><i className="ph ph-pencil"></i> Edit</a></li><li className="divider"></li><li><a href="/Admin/Groups/GroupTools?gid=3cb113d3-8345-4784-8e31-b0c2a0b24cc6"><i className="ph ph-wrench"></i> Tools</a></li></ul></div></td><td id="gvGroups_tccell6_1" className="dxgv dx-ar" style={{textDecoration: "underline"}}><a href="/Admin/Locations/View/3cb113d3-8345-4784-8e31-b0c2a0b24cc6" style={{textDecoration: "underline"}}>1 Locations</a></td>
                  </tr><tr id="gvGroups_DXDataRow7" className="dxgvDataRow" >
                    <td id="gvGroups_tccell7_0" className="dxgv"><div className="btn-group"><span className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">AshitaRathi<span className="caret"></span></span><ul className="dropdown-menu"><li><a href="/Admin/Groups/GroupDashboard/5de0b96f-1e99-4833-af2d-b0f1583b41c3"><i className="ph ph-gauge"></i> Dashboard</a></li><li><a href="/Admin/Groups/GroupSettingsEditor/5de0b96f-1e99-4833-af2d-b0f1583b41c3"><i className="ph ph-gear"></i> Settings Editor</a></li><li><a href="/Admin/Groups/GroupIntegrationsPortal/5de0b96f-1e99-4833-af2d-b0f1583b41c3" target="_blank"><i className="ph ph-plug"></i> Integrations Portal</a></li><li><a href="/Admin/Groups/GroupInStoreCredentialsPortal/5de0b96f-1e99-4833-af2d-b0f1583b41c3" target="_blank"><i className="ph ph-key"></i> Orbit Credentials Portal</a></li><li><a className="viewDetailsClass" data-id="5de0b96f-1e99-4833-af2d-b0f1583b41c3"><i className="ph ph-list"></i> Details</a></li><li><a href="/Admin/Groups/Edit/5de0b96f-1e99-4833-af2d-b0f1583b41c3"><i className="ph ph-pencil"></i> Edit</a></li><li className="divider"></li><li><a href="/Admin/Groups/GroupTools?gid=5de0b96f-1e99-4833-af2d-b0f1583b41c3"><i className="ph ph-wrench"></i> Tools</a></li></ul></div></td><td id="gvGroups_tccell7_1" className="dxgv dx-ar" style={{textDecoration: "underline"}}><a href="/Admin/Locations/View/5de0b96f-1e99-4833-af2d-b0f1583b41c3" style={{textDecoration: "underline"}}>1 Locations</a></td>
                  </tr><tr id="gvGroups_DXDataRow8" className="dxgvDataRow" >
                    <td id="gvGroups_tccell8_0" className="dxgv"><div className="btn-group"><span className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">BANZAI<span className="caret"></span></span><ul className="dropdown-menu"><li><a href="/Admin/Groups/GroupDashboard/0c10e6e6-f6dc-4b79-9b0e-253530387a81"><i className="ph ph-gauge"></i> Dashboard</a></li><li><a href="/Admin/Groups/GroupSettingsEditor/0c10e6e6-f6dc-4b79-9b0e-253530387a81"><i className="ph ph-gear"></i> Settings Editor</a></li><li><a href="/Admin/Groups/GroupIntegrationsPortal/0c10e6e6-f6dc-4b79-9b0e-253530387a81" target="_blank"><i className="ph ph-plug"></i> Integrations Portal</a></li><li><a href="/Admin/Groups/GroupInStoreCredentialsPortal/0c10e6e6-f6dc-4b79-9b0e-253530387a81" target="_blank"><i className="ph ph-key"></i> Orbit Credentials Portal</a></li><li><a className="viewDetailsClass" data-id="0c10e6e6-f6dc-4b79-9b0e-253530387a81"><i className="ph ph-list"></i> Details</a></li><li><a href="/Admin/Groups/Edit/0c10e6e6-f6dc-4b79-9b0e-253530387a81"><i className="ph ph-pencil"></i> Edit</a></li><li className="divider"></li><li><a href="/Admin/Groups/GroupTools?gid=0c10e6e6-f6dc-4b79-9b0e-253530387a81"><i className="ph ph-wrench"></i> Tools</a></li></ul></div></td><td id="gvGroups_tccell8_1" className="dxgv dx-ar" style={{textDecoration: "underline"}}><a href="/Admin/Locations/View/0c10e6e6-f6dc-4b79-9b0e-253530387a81" style={{textDecoration: "underline"}}>2 Locations</a></td>
                  </tr><tr id="gvGroups_DXDataRow9" className="dxgvDataRow dxgvLVR">
                    <td id="gvGroups_tccell9_0" className="dxgv"><div className="btn-group"><span className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">Behrad Group Test 1<span className="caret"></span></span><ul className="dropdown-menu"><li><a href="/Admin/Groups/GroupDashboard/a8c9bd24-7cd0-4e6c-b611-f5f8b5958863"><i className="ph ph-gauge"></i> Dashboard</a></li><li><a href="/Admin/Groups/GroupSettingsEditor/a8c9bd24-7cd0-4e6c-b611-f5f8b5958863"><i className="ph ph-gear"></i> Settings Editor</a></li><li><a href="/Admin/Groups/GroupIntegrationsPortal/a8c9bd24-7cd0-4e6c-b611-f5f8b5958863" target="_blank"><i className="ph ph-plug"></i> Integrations Portal</a></li><li><a href="/Admin/Groups/GroupInStoreCredentialsPortal/a8c9bd24-7cd0-4e6c-b611-f5f8b5958863" target="_blank"><i className="ph ph-key"></i> Orbit Credentials Portal</a></li><li><a className="viewDetailsClass" data-id="a8c9bd24-7cd0-4e6c-b611-f5f8b5958863"><i className="ph ph-list"></i> Details</a></li><li><a href="/Admin/Groups/Edit/a8c9bd24-7cd0-4e6c-b611-f5f8b5958863"><i className="ph ph-pencil"></i> Edit</a></li><li className="divider"></li><li><a href="/Admin/Groups/GroupTools?gid=a8c9bd24-7cd0-4e6c-b611-f5f8b5958863"><i className="ph ph-wrench"></i> Tools</a></li></ul></div></td><td id="gvGroups_tccell9_1" className="dxgv dx-ar" style={{textDecoration: "underline"}}><a href="/Admin/Locations/View/a8c9bd24-7cd0-4e6c-b611-f5f8b5958863" style={{textDecoration: "underline"}}>1 Locations</a></td>
                  </tr>
                </tbody></table><div className="dxmLite dxm-ltr">
                  <div id="gvGroups_DXFilterRowMenu" style={{ zIndex: 20000, display: "none", position: "absolute" }}>
                    <div className="dxm-popupMain dxm-shadow dxm-popup" id="gvGroups_DXFilterRowMenu_DXME_">
                      <ul className="dx dxm-gutter">
                        <li className="dxm-item" id="gvGroups_DXFilterRowMenu_DXI0_"><div className="dxm-content dxm-hasText" id="gvGroups_DXFilterRowMenu_DXI0_T">
                          <img className="dxWeb_mSubMenuItem dxm-image dx-vam" src="/DXR.axd?r=1_87-i7Gvq" alt="" id="gvGroups_DXFilterRowMenu_DXI0_Img" /><span className="dx-vam dxm-contentText">Begins with</span>
                        </div><b className="dx-clear"></b></li><li className="dxm-spacing" id="gvGroups_DXFilterRowMenu_DXI1_II"></li><li className="dxm-item" id="gvGroups_DXFilterRowMenu_DXI1_"><div className="dxm-content dxm-hasText" id="gvGroups_DXFilterRowMenu_DXI1_T">
                          <img className="dxWeb_mSubMenuItem dxm-image dx-vam" src="/DXR.axd?r=1_87-i7Gvq" alt="" id="gvGroups_DXFilterRowMenu_DXI1_Img" /><span className="dx-vam dxm-contentText">Contains</span>
                        </div><b className="dx-clear"></b></li><li className="dxm-spacing" id="gvGroups_DXFilterRowMenu_DXI2_II"></li><li className="dxm-item" id="gvGroups_DXFilterRowMenu_DXI2_"><div className="dxm-content dxm-hasText" id="gvGroups_DXFilterRowMenu_DXI2_T">
                          <img className="dxWeb_mSubMenuItem dxm-image dx-vam" src="/DXR.axd?r=1_87-i7Gvq" alt="" id="gvGroups_DXFilterRowMenu_DXI2_Img" /><span className="dx-vam dxm-contentText">Doesn't contain</span>
                        </div><b className="dx-clear"></b></li><li className="dxm-spacing" id="gvGroups_DXFilterRowMenu_DXI3_II"></li><li className="dxm-item" id="gvGroups_DXFilterRowMenu_DXI3_"><div className="dxm-content dxm-hasText" id="gvGroups_DXFilterRowMenu_DXI3_T">
                          <img className="dxWeb_mSubMenuItem dxm-image dx-vam" src="/DXR.axd?r=1_87-i7Gvq" alt="" id="gvGroups_DXFilterRowMenu_DXI3_Img" /><span className="dx-vam dxm-contentText">Ends with</span>
                        </div><b className="dx-clear"></b></li><li className="dxm-spacing" id="gvGroups_DXFilterRowMenu_DXI4_II"></li><li className="dxm-item" id="gvGroups_DXFilterRowMenu_DXI4_"><div className="dxm-content dxm-hasText" id="gvGroups_DXFilterRowMenu_DXI4_T">
                          <img className="dxWeb_mSubMenuItem dxm-image dx-vam" src="/DXR.axd?r=1_87-i7Gvq" alt="" id="gvGroups_DXFilterRowMenu_DXI4_Img" /><span className="dx-vam dxm-contentText">Equals</span>
                        </div><b className="dx-clear"></b></li><li className="dxm-spacing" id="gvGroups_DXFilterRowMenu_DXI5_II"></li><li className="dxm-item" id="gvGroups_DXFilterRowMenu_DXI5_"><div className="dxm-content dxm-hasText" id="gvGroups_DXFilterRowMenu_DXI5_T">
                          <img className="dxWeb_mSubMenuItem dxm-image dx-vam" src="/DXR.axd?r=1_87-i7Gvq" alt="" id="gvGroups_DXFilterRowMenu_DXI5_Img" /><span className="dx-vam dxm-contentText">Doesn't equal</span>
                        </div><b className="dx-clear"></b></li><li className="dxm-spacing" id="gvGroups_DXFilterRowMenu_DXI6_II"></li><li className="dxm-item" id="gvGroups_DXFilterRowMenu_DXI6_"><div className="dxm-content dxm-hasText" id="gvGroups_DXFilterRowMenu_DXI6_T">
                          <img className="dxWeb_mSubMenuItem dxm-image dx-vam" src="/DXR.axd?r=1_87-i7Gvq" alt="" id="gvGroups_DXFilterRowMenu_DXI6_Img" /><span className="dx-vam dxm-contentText">Is less than</span>
                        </div><b className="dx-clear"></b></li><li className="dxm-spacing" id="gvGroups_DXFilterRowMenu_DXI7_II"></li><li className="dxm-item" id="gvGroups_DXFilterRowMenu_DXI7_"><div className="dxm-content dxm-hasText" id="gvGroups_DXFilterRowMenu_DXI7_T">
                          <img className="dxWeb_mSubMenuItem dxm-image dx-vam" src="/DXR.axd?r=1_87-i7Gvq" alt="" id="gvGroups_DXFilterRowMenu_DXI7_Img" /><span className="dx-vam dxm-contentText">Is less than or equal to</span>
                        </div><b className="dx-clear"></b></li><li className="dxm-spacing" id="gvGroups_DXFilterRowMenu_DXI8_II"></li><li className="dxm-item" id="gvGroups_DXFilterRowMenu_DXI8_"><div className="dxm-content dxm-hasText" id="gvGroups_DXFilterRowMenu_DXI8_T">
                          <img className="dxWeb_mSubMenuItem dxm-image dx-vam" src="/DXR.axd?r=1_87-i7Gvq" alt="" id="gvGroups_DXFilterRowMenu_DXI8_Img" /><span className="dx-vam dxm-contentText">Is greater than</span>
                        </div><b className="dx-clear"></b></li><li className="dxm-spacing" id="gvGroups_DXFilterRowMenu_DXI9_II"></li><li className="dxm-item" id="gvGroups_DXFilterRowMenu_DXI9_"><div className="dxm-content dxm-hasText" id="gvGroups_DXFilterRowMenu_DXI9_T">
                          <img className="dxWeb_mSubMenuItem dxm-image dx-vam" src="/DXR.axd?r=1_87-i7Gvq" alt="" id="gvGroups_DXFilterRowMenu_DXI9_Img" /><span className="dx-vam dxm-contentText">Is greater than or equal to</span>
                        </div><b className="dx-clear"></b></li><li className="dxm-spacing" id="gvGroups_DXFilterRowMenu_DXI10_II"></li><li title="Two wildcard symbols are supported:
 '%' substitutes zero or more characters;
 '_' substitutes a single character." className="dxm-item" id="gvGroups_DXFilterRowMenu_DXI10_"><div className="dxm-content dxm-hasText" id="gvGroups_DXFilterRowMenu_DXI10_T">
                            <img title="Two wildca" className="dxWeb_mSubMenuItem dxm-image dx-vam" src="/DXR.axd?r=1_87-i7Gvq" alt="" id="gvGroups_DXFilterRowMenu_DXI10_Img" /><span title="Two wildcard symbols are supported:
 '%' substitutes zero or more characters;
 '_' substitutes a single character." className="dx-vam dxm-contentText">Like ('%', '_')</span>
                          </div><b className="dx-clear"></b></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <table id="gvGroups_LP" className="dxgvLoadingPanel" style={{ left: "0px", top: "0px", zIndex: 30000, display: "none" }}>
                  <tbody><tr>
                    <td className="dx" style={{ paddingRight: "0px" }}><img className="dxlp-loadingImage dxlp-imgPosLeft" src="/DXR.axd?r=1_87-i7Gvq" alt="" style={{ verticalAlign: "middle" }} /></td><td className="dx" style={{ paddingLeft: "0px" }}><span id="gvGroups_TL">Loading…</span></td>
                  </tr>
                  </tbody></table><div id="gvGroups_LD" className="dxgvLoadingDiv" style={{ display: "none", zIndex: 29999, position: "absolute" }}>

                </div>
                <img id="gvGroups_IADD" className="dxGridView_gvDragAndDropArrowDown" src="/DXR.axd?r=1_87-i7Gvq" alt="Down Arrow" style={{ position: "absolute", visibility: "hidden", top: "-100px" }} />
                <img id="gvGroups_IADU" className="dxGridView_gvDragAndDropArrowUp" src="/DXR.axd?r=1_87-i7Gvq" alt="Up Arrow" style={{ position: "absolute", visibility: "hidden", top: "-100px" }} />
                <img id="gvGroups_IADL" className="dxGridView_gvDragAndDropArrowLeft" src="/DXR.axd?r=1_87-i7Gvq" alt="Left Arrow" style={{ position: "absolute", visibility: "hidden", top: "-100px" }} />
                <img id="gvGroups_IADR" className="dxGridView_gvDragAndDropArrowRight" src="/DXR.axd?r=1_87-i7Gvq" alt="Right Arrow" style={{ position: "absolute", visibility: "hidden", top: "-100px" }} />
                <img id="gvGroups_IDHF" className="dxGridView_gvDragAndDropHideColumn" src="/DXR.axd?r=1_87-i7Gvq" alt="Hide" style={{ position: "absolute", visibility: "hidden", top: "-100px" }} />
              </td>
            </tr>
            </tbody></table>


          <div id="group_details_modal" className="modal fade" role="dialog" aria-labelledby="group_details_modal_header" aria-hidden="true">
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" aria-hidden="true"><i className="ph ph-x"></i></button>
                  <h3 id="group_details_modal_header">Details</h3>
                </div>
                <div className="modal-body" id="group_details" style={{ maxHeight: "390px", overflow: "auto" }}></div>
                <div className="modal-footer">
                  <button className="btn btn-primary" data-dismiss="modal" aria-hidden="true">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
